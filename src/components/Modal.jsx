import React from 'react'

export const Modal = ({
  title,
  description,
  handleBtnMessage,
  handleBtnClick
}) => {
  return (
    <div className="flex flex-col space-y-4 min-w-screen h-screen animated fadeIn faster  fixed  left-0 top-0 justify-center items-center inset-0 z-50 outline-none focus:outline-none bg-gray-900 bg-opacity-90">
      <div className="flex flex-col p-8 bg-white shadow-md hover:shodow-lg rounded-2xl mx-4 md:mx-0">
        <div className="flex items-center md:justify-between flex-col md:flex-row">
          <div className="flex items-center">
            <div className="flex flex-col ml-3">
              <div className="font-medium leading-none">
                {title}
              </div>
              <p className="text-sm text-gray-600 leading-none mt-3 md:mt-1">
                {description}
              </p>
            </div>
          </div>
          <button onClick={() => handleBtnClick()} className="flex-no-shrink bg-red-500 px-5 md:ml-4 py-2 text-sm shadow-sm hover:shadow-lg font-medium tracking-wider border-2 border-red-500 text-white rounded-full mt-6 md:mt-0">
            {handleBtnMessage}
          </button>
        </div>
      </div>
    </div>
  )
}
