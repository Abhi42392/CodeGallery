import React from 'react'

const LoadingBar = () => {
  return (
   <div className="w-full h-[2px] overflow-hidden relative">
    <div
        className="absolute h-full w-1/3 bg-purple-600"
        style={{
        animation: 'slide 1.5s linear infinite',
        }}
    />
    <style>{`
        @keyframes slide {
        0% { left: -33.33%; }
        100% { left: 100%; }
        }
    `}</style>
    </div>

  )
}

export default LoadingBar