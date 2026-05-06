export default function SearchBar() {
  return (
    <div className="absolute top-4 left-4 z-10 w-64">
      <input 
        type="text" 
        placeholder="Search Vancouver..." 
        className="w-full p-2 rounded-lg border shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}