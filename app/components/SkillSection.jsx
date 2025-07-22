import React, { useState } from 'react'
import Pencil from '../Icons/Pencil'
import skillsData from '../constants/skillsData'
import Wrong from '../Icons/Wrong'
const SkillSection = ({ skills, removeSkill, addSkill, Edited }) => {
  const [skillEdit, setSkillEdit] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const filteredSuggestions = skillsData.filter(
    (skill) =>
      skill.toLowerCase().includes(inputValue.toLowerCase()) &&
      !skills.includes(skill)
  )


  return (
    <div className="mb-6">
      <div className="flex flex-col gap-4 px-6 pb-6 pt-4 rounded-xl shadow-md bg-white relative mt-6">
        <h1 className="text-2xl font-semibold text-gray-800">Skills</h1>

        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <div
              key={index}
              className="flex items-center px-3 py-1 text-sm border rounded-full bg-purple-100 text-purple-800"
            >
              <span>{skill}</span>
              
                <span
                  className="ml-2 cursor-pointer text-black"
                  onClick={() => removeSkill(skill)}
                >
                  <Wrong />
                </span>
              
            </div>
          ))}
        </div>

        {skillEdit && (
          <div className="relative mt-2">
            <input
              type="text"
              placeholder="Type a skill..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-1/3 px-4 py-2 border border-purple-300 focus:ring-2 outline-0 focus:ring-purple-300 rounded-md text-sm"
            />
            {inputValue &&(
              <div className="absolute  z-10 mt-1 w-full max-h-40 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-md">
                {filteredSuggestions.map((skill, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      addSkill(skill)
                      setInputValue('')
                    }}
                    className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                  >
                    {skill}
                  </div>
                ))}
                {filteredSuggestions.length===0&&
                <p className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm">No matched Skills</p>}
              </div>
            )}
          </div>
        )}

        <div
          className="cursor-pointer absolute top-2 right-4"
          onClick={() => {setSkillEdit(true),Edited(true)}}
        >
          {skillEdit?
          (<p className='text-purple-600 text-3xl opacity-50 font-bold cursor-not-allowed outline-0'>+</p>)
          :(<p className='text-purple-600 text-3xl font-bold outline-0'>+</p>)
          }
        </div>
      </div>
    </div>
  )
}

export default SkillSection
