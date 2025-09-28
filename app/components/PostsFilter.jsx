"use client";
import React, { useState, useEffect } from "react";
import { categoryFilters } from "@/app/constants/data";
import ProjectCard from '@/app/components/ProjectCard'


const PostsFilter = ({posts}) => {
  const [searchTitle, setSearchTitle] = useState("");
  const [category, setCategory] = useState("");
  
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [filter, setFilter] = useState("");
  const [filteredPosts, setFilteredPosts] = useState(posts)

  const handleFilterClick = (value) => {
    setFilter(prev=>(prev===value?"":value));
    setShowFilterDropdown(false);
  };

  const handleCategoryClick = (value) => {
    setCategory(prev=>(prev===value?"":value));
    setShowCategoryDropdown(false);
  };

  const finalFilteredPosts = filteredPosts.filter((post) => (
    category === "" || post.category.toLowerCase() === category.toLowerCase()
  ))
  
  const search = (() => {
    const filteredBySearch = posts.filter((post) =>
      (post.title.toLowerCase().includes(searchTitle.toLowerCase()) || 
       post.description.toLowerCase().includes(searchTitle.toLowerCase()))
    )
    setFilteredPosts(filteredBySearch)
  })

  const sortedPosts = [...finalFilteredPosts].sort((a, b) => {
    if (filter === "Most Recent") return new Date(b.createdAt) - new Date(a.createdAt);
    if (filter === "Older") return new Date(a.createdAt) - new Date(b.createdAt);
    if (filter === "Most Viewed") return b.views - a.views;
    if (filter === "Popularity") return b.likes - a.likes;
    return 0;
  });
  //to trigger search function when user clicks enter button
  const handleKeyDown=(e)=>{
    if(e.key==="Enter"){
      search();
    }
  }

  // Custom Arrow SVG Component
  //apply smooth rotate effect for arrowicon
  const ArrowIcon = ({ isOpen }) => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-transform duration-300 ${
        isOpen ? 'rotate-180' : 'rotate-0'
      }`}
    >
      <path
        d="M4 6L8 10L12 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
  
  return (
    <div>
        <div className="w-full px-5">
            <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-3">
                {/* Search Input */}
                <div className="w-full md:w-[40%] relative">
                  <input
                    type="text"
                    value={searchTitle}
                    onChange={(e) => setSearchTitle(e.target.value)}
                    placeholder="Search posts by title"
                    onKeyDown={handleKeyDown} //to trigger search function on clicking enter key
                    className="w-full pl-4 pr-32 py-2 rounded-full text-gray-800 placeholder:text-gray-500
                              bg-white border-2 border-purple-600
                              focus:outline-none focus:ring-1 focus:ring-purple-300 focus:border-purple-600
                              shadow-lg transition duration-300"
                  />
                  {/* cross icon visible only when searchTitle is not empty */}
                  {searchTitle && (
                    <button 
                      onClick={() => { 
                        setSearchTitle("");
                        setFilteredPosts(posts);
                      }} 
                      className="absolute top-1/2 -translate-y-1/2 right-26 text-gray-500 hover:text-gray-700 cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                  <button 
                    onClick={search} 
                    className="absolute top-0 right-0 px-6 text-white cursor-pointer bg-purple-400 h-full rounded-r-full hover:bg-purple-500 transition-colors"
                  >
                    Search
                  </button>
                </div>

                <div className="flex gap-3 flex-wrap items-center">
                  {/* Filter Dropdown (styled like category) */}
                  <div className="relative cursor-pointer">
                    <button
                      onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                      className="flex items-center cursor-pointer justify-between min-w-[11rem] px-6 py-2 text-sm border border-gray-200 rounded-md hover:border-gray-300 transition-all duration-200"
                    >
                      <span>{filter || "Sort by"}</span>
                      <ArrowIcon isOpen={showFilterDropdown} />
                    </button>
                    {/*apply styling to this drop down menu to smoothly slide down when selected*/}
                    {showFilterDropdown && (
                      <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-md shadow-md z-10 animate-fadeIn">
                        {["Popularity", "Most Viewed", "Most Recent", "Older"].map((option) => (
                          <button
                            key={option}
                            onClick={() => handleFilterClick(option)}
                            className={`block w-full text-left  px-4 py-2 hover:bg-gray-100 text-sm transition-colors duration-150 ${
                              filter === option ? "bg-gray-100 font-semibold" : ""
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                    {/*apply styling to this drop down menu to smoothly slide down when selected*/}

                  {/* Category Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                      className="flex items-center cursor-pointer justify-between min-w-[11rem] px-6 py-2 border rounded-md text-sm border-gray-200 hover:border-gray-300 transition-all duration-200"
                    >
                      <span>{category || "All Categories"}</span>
                      <ArrowIcon isOpen={showCategoryDropdown} />
                    </button>

                    {showCategoryDropdown && (
                      <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-md shadow-md z-10 animate-fadeIn">
                        {categoryFilters.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => handleCategoryClick(cat)}
                            className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors duration-150 ${
                              category === cat ? "bg-gray-100 font-semibold" : ""
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
            </div>
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mx-4 mb-4 mt-20 gap-8'>
          {sortedPosts.map((p) => (
            <ProjectCard
              id={p._id}
              key={p._id}
              title={p.title}
              user={p.user}
              image={p.poster}
              likesCount={p.likes}
              viewsCount={p.views}
              description={p.description}
            />
          ))}
        </div>
    </div>
  );
};

export default PostsFilter;