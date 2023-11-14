import Image from 'next/image';
import { getShortName, toCurrency } from '@/utils/convert';

interface CartItemProps extends models.CartItem {
  handleChange: (value: number) => unknown;
  handleDelete: () => unknown;
}

export default function CartItem({
  product,
  quantity,
  handleChange,
  handleDelete,
}: CartItemProps) {
  return (
    <div className="mb-3 rounded shadow-md">
      <div className="flex">
        <Image
          className="rounded-t-lg"
          style={{ height: '80px', width: 'auto' }}
          src={product.styleImages_default_imageURL}
          alt={product.productDisplayName}
          width={480}
          height={640}
        />
        <div className="flex-grow p-2">
          <h5 className="mb-1 font-semibold">{product.productDisplayName}</h5>
          <p className="text-neutral-500 text-sm">
            {getShortName(product.productDescriptors_description_value)}
          </p>
        </div>
      </div>
      <div className="flex justify-between items-center px-2 py-1 text-sm bg-orange-300">
        <div className="font-bold">
          {toCurrency(product.price)}
        </div>
        <div>
          <input
            className="text-center w-12"
            type="number"
            value={quantity}
            onChange={(ev) => {
              handleChange(Number(ev.currentTarget.value));
            }}
            max={Number(product.stockQty)}
          />
          <span> of {Number(product.stockQty)}</span>
        </div>
        <div
          onClick={() => {
            handleDelete();
          }}
          className="fas fa-trash cursor-pointer"></div>
      </div>
    </div>
  );
}
