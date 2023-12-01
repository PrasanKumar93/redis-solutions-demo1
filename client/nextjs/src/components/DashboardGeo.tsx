'use client';
import { CartContext, CartDispatchContext } from '@/components/CartProvider';
import { useState, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';

import ProductCard from '@/components/ProductCard';
import Navbar from '@/components/Navbar';
import Cart from '@/components/Cart';
import Alert from '@/components/Alert';
import {
    triggerResetInventory,
    getZipCodes, getStoreProductsByGeoFilter, getProducts, getStoreProductsByChatAndGeoFilter
} from '@/utils/services';
import Chat from './Chat';


export default function Home() {
    const [products, setProducts] = useState<models.Product[]>();
    const [zipCodeList, setZipCodeList] = useState<ListItem[]>();
    const [selectedZipCodeInfo, setSelectedZipCodeInfo] = useState<models.ZipCode>();
    const [alertNotification, setAlertNotification] = useState({ title: '', message: '' });
    const [nearestStore, setNearestStore] = useState<string>();
    const cartDispatch = useContext(CartDispatchContext);

    async function suggestionSelectedCallback(itm: ListItem) {
        setSelectedZipCodeInfo(itm.value);
        await refreshProducts("", itm.value);
    }

    async function refreshProducts(_search: string, _zipCodeInfo?: models.ZipCode) {
        //_zipCodeInfo not passed on search textbox submit
        if (!_search) {
            _search = window?.location?.search ?? '';
        }
        const searchText = _search.replace(/\?search=/g, '');

        _zipCodeInfo = _zipCodeInfo || selectedZipCodeInfo;
        if (_zipCodeInfo) {
            const products = await getStoreProductsByGeoFilter(_zipCodeInfo, searchText);
            setProducts(products);

            setNearestStore("");
            if (products?.length) {
                setNearestStore(products[0].storeId);
            }

        } else {
            const products = await getProducts(searchText);
            setProducts(products);
        }
    }

    async function refreshChatProducts(searchText: string) {
        if (selectedZipCodeInfo) {
            const products = await getStoreProductsByChatAndGeoFilter(selectedZipCodeInfo, searchText);
            setProducts(products);

            setNearestStore("");
            if (products?.length) {
                setNearestStore(products[0].storeId);
            }
        } else {
            const products = await getProducts(searchText);
            setProducts(products);
        }
    }

    async function getZipCodeList() {
        const listItems: ListItem[] = [];

        const zipCodes = await getZipCodes();
        for (let z of zipCodes) {
            if (z?.zipCode) {
                listItems.push({
                    text: z?.zipCode?.toString(),
                    id: z?.zipCode?.toString(),
                    value: z
                });
            }
        }

        return listItems;
    }

    async function resetStockQtyBtnClick() {
        setAlertNotification({ title: '', message: '' });

        await triggerResetInventory();
        await refreshProducts("");

        setAlertNotification({
            title: `RESET STOCK QTY`,
            message:
                'Stock Qty of all products are updated to default value!',
        });
    }

    async function refreshStore() {
        const zipCodes = await getZipCodeList();
        if (zipCodes?.length) {
            setZipCodeList(zipCodes);
            const randomCode = Math.floor(Math.random() * zipCodes.length + 1) - 1;
            let newZipCode = zipCodes[randomCode].value;
            const currentZipCode = selectedZipCodeInfo;

            while (!!newZipCode && !!currentZipCode && newZipCode.zipCode === currentZipCode.zipCode) {
                const randomCode = Math.floor(Math.random() * zipCodes.length + 1) - 1;
                newZipCode = zipCodes[randomCode].value;
            }

            setSelectedZipCodeInfo(newZipCode);

            await refreshProducts("", newZipCode);
            cartDispatch({
                type: 'clear_cart',
            });
        }
    }

    /* eslint-disable:react-hooks/exhaustive-deps */
    useEffect(() => {
        (async () => {
            const search = window?.location?.search ?? '';
            await refreshProducts(search);
        })();
    }, []);
    /* eslint-enable:react-hooks/exhaustive-deps */

    return (
        <>
            <Navbar currentStore={products?.[0]?.storeName} refreshProducts={refreshProducts} refreshStore={refreshStore} />
            <Chat refreshProducts={refreshChatProducts} />
            <Cart refreshProducts={refreshProducts} setAlertNotification={setAlertNotification} />
            <main className="pt-12">
                <div className="max-w-screen-xl mx-auto mt-6 px-6 pb-6">
                    <div className="mb-2 flex justify-between">
                        <span>Showing {products?.length} products</span>
                        <button
                            type="button"
                            onClick={resetStockQtyBtnClick}
                            className="inline-block rounded bg-slate-300 hover:bg-slate-400 px-4 pt-2 pb-2 text-xs font-semibold uppercase leading-normal text-black">
                            Reset Stock QTY
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {products?.map((product) => {
                            const cardColorCss = (product.storeId != nearestStore) ? 'bg-orange-100' : '';
                            return (
                                <ProductCard key={product.productId} product={product} cardColorCss={cardColorCss} />
                            )
                        }
                        )}
                    </div>
                </div>
            </main>
            {!!alertNotification &&
                typeof window !== 'undefined' &&
                createPortal(<Alert {...alertNotification} />, document.body)}
        </>
    );
}
