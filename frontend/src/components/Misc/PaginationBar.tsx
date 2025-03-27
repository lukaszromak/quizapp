import { ChevronLeftIcon, ChevronRightIcon, EllipsisHorizontalIcon } from "@heroicons/react/24/outline"

interface Props {
  numPages: number,
  currentPage: number,
  setCurrentPage: React.Dispatch<React.SetStateAction<any>>
}

const cellStyle = "border border-gray-300 p-2 rounded hover:cursor-pointer"

function PaginationBar(props: Props) {
  const { numPages, currentPage, setCurrentPage } = props;

  const paginationBar = () => {
    let pages = [];
    if (numPages <= 9) {
      for (let i = 0; i < numPages; i++) {
        pages.push(i + 1);
      }
    } else if (numPages > 9 && currentPage >= 0 && currentPage <= 6) {
      for (let i = 0; i < 7; i++) {
        pages.push(i + 1);
      }
      pages.push(-1);
      pages.push(numPages)
    } else if (numPages > 9 && currentPage >= 7 && currentPage <= numPages - 8) {
      pages.push(1)
      pages.push(-1);
      for (let i = currentPage - 2; i <= currentPage + 2; i++) {
        pages.push(i + 1);
      }
      pages.push(-1);
      pages.push(numPages)
    } else if (numPages > 9 && currentPage >= numPages - 7 && currentPage < numPages) {
      pages.push(1);
      pages.push(-1);
      for (let i = numPages - 7; i < numPages; i++) {
        pages.push(i + 1);
      }
    }

    const handlePageChange = (numPage: number) => {
      if (numPage >= 0 && numPage < numPages) {
        setCurrentPage(numPage);
      }
    }

    return (
      <div className="flex justify-center">
        <div onClick={() => handlePageChange(currentPage - 1)} className={cellStyle}>
          <ChevronLeftIcon className="h-5 w-5"/>
        </div>
        {pages.map((page, idx) => (
          page === -1 ? <div key={idx} className={cellStyle}><EllipsisHorizontalIcon className="h-5 w-5"/></div> :
            <div key={idx} onClick={() => handlePageChange(page - 1)} className={`${cellStyle} ${page === currentPage + 1 ? "bg-gray-200" : ""}`}>{page}</div>
        ))}
        <div onClick={() => handlePageChange(currentPage + 1)} className={cellStyle}>
          <ChevronRightIcon className="h-5 w-5"/>
        </div>
      </div>
    );
  }

  return (
    paginationBar()
  )
}

export default PaginationBar