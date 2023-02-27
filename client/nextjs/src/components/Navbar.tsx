import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="relative px-5 flex justify-between items-center h-14 bg-slate-600 drop-shadow-md">
      <div>
        <Link href="/" className="text-white text-2xl font-semibold italic">
          Redis Shopping
        </Link>
      </div>

      <div
        id="main-nav"
        className="bg-gray-700 flex space-y-0 relative top-0 right-0 p-0 flex-row h-full flex-grow justify-between items-center ml-10 bg-inherit">
        <div className="order-first flex flex-row items-start text-pink-200 space-y-0 space-x-3">
          <Link className="hover:text-white" href="/orders">
            Orders
          </Link>
        </div>

        <form className="order-last mb-0 pr-8" action="">
          <input
            className="w-72 py-1 pl-3 pr-10 rounded-full focus:outline-0"
            type="text"
            placeholder="Search.."
            name="search"
          />
          <button className="-ml-8 border-6 bg-trasparent" type="submit">
            <i className="fa fa-search text-gray-400"></i>
          </button>
        </form>
      </div>
    </nav>
  );
}
