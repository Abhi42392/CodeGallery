"use client";
import React, { useState } from "react";
import Pencil from "../Icons/Pencil";
import SkillSection from "./SkillSection";
import Wrong from "../Icons/Wrong";
import PhoneInput from "react-phone-input-2";
import 'react-phone-input-2/lib/style.css';
import LoadingBar from "./LoadingBar";


const MyProfileForm = ({ user }) => {
  const [userData, setUserData] = useState({
    name: user.name || "",
    phone: user.phone || "",
    headline: user.headline || "",
    avatarUrl: user.avatarUrl || "",
    email: user.email || "",
    about: user.about || "",
    portfolio: user.portfolio || [],
    resume: user.resume || undefined,
    skills: user.skills || [],
  });

  const [isEdited, setIsEdited] = useState(false);
  const [contactEdit, setContactEdit] = useState(false);
  const [aboutEdit, setAboutEdit] = useState(false);
  const [portfolioEdit, setPortfolioEdit] = useState(false);
  const [showProfilePic, setShowProfilePic] = useState(user.avatarUrl);
  const [nameHeadlineEdit, setNameHeadLineEdit] = useState(false);
  const [error, setError] = useState(false);
  const[phone, setPhone]=useState(userData.phone||"")
  const[isLoading,setIsLoading]=useState(false)

  const handleStateChange = (e) => {
    const field = e.target.id;
    const value = e.target.value;
    setUserData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePortfolioChange = (index, field, value) => {
    const updated = [...userData.portfolio];
    updated[index][field] = value;
    setUserData((prev) => ({ ...prev, portfolio: updated }));
  };

  const handleChangeImage = (e) => {
    setIsEdited(true);
    const file = e.target.files[0];
    const imageUrl = URL.createObjectURL(file);
    setShowProfilePic(imageUrl);
    setUserData((prev) => ({ ...prev, avatarUrl: file }));
  };

  const uploadResume = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUserData((prev) => ({
      ...prev,
      resume: {
        fileName: file.name,
        url: file,
      },
    }));
    setIsEdited(true);
  };

  const removeSkill = (skillToRemove) => {
    const filteredSkills = userData.skills.filter((skill) => skill !== skillToRemove);
    setUserData((prev) => ({
      ...prev,
      skills: filteredSkills,
    }));
  };

  const addSkill = (newSkill) => {
    if (!userData.skills.includes(newSkill)) {
      setUserData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill],
      }));
    }
  };

  const handlePhoneChange = (value, country, e, formattedValue) => {
  
      const dialCode = country.dialCode;
      const fullNumber = `+${dialCode} ${value.replace(dialCode, "")}`;
      setPhone(fullNumber);
  
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
       setIsLoading(true)
      const fd = new FormData();
      fd.append("name", userData.name);
      fd.append("phone", phone);
      fd.append("headline", userData.headline);
      fd.append("email", userData.email);
      fd.append("about", userData.about);

      fd.append("avatarUrl", userData.avatarUrl);

      if (userData.resume?.url instanceof File) {
        fd.append("resume", userData.resume.url);
      }
      fd.append("skills", JSON.stringify(userData.skills));
      fd.append("portfolio", JSON.stringify(userData.portfolio));

      const response = await fetch("/api/user/update-profile", {
        method: "POST",
        body: fd,
      });

      const data = await response.json();
      if (!data.success) {
        setError(data.error);
        setIsLoading(false)
        setIsEdited(false)
        return;
      }
      setIsEdited(false)
      setIsLoading(false)
      console.log("User Profile updated successfully");
    } catch (err) {
      console.error("Error submitting profile:", err);
      setError("Unexpected error occurred");
    }
  };

  return (
    <div className="pt-[66px] ml-[20vw] max-w-[55vw]">
      <form>
        {/* Top Profile Section */}
        <div className="relative -translate-y-1/4 flex gap-8 w-full">
          <div className="relative">
            <img
              src={showProfilePic}
              height={250}
              width={250}
              className="rounded-3xl ml-10"
              alt="profile pic"
            />
            <div className="absolute top-2 right-4 cursor-pointer">
              <label htmlFor="avatarUrl" className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  id="avatarUrl"
                  onChange={handleChangeImage}
                />
                <Pencil isDisable={false} />
              </label>
            </div>
          </div>
          <div className="relative">
            <div className="absolute bottom-0 w-[450px]">
              <div>
                {nameHeadlineEdit ? (
                  <>
                    <span className="flex gap-2 items-center">
                        <input
                          id="name"
                          type="text"
                          value={userData.name}
                          onChange={handleStateChange}
                          className="outline-none bg-transparent text-xl font-bold"
                          placeholder="Your Name"
                        />
                        <Pencil isDisable={nameHeadlineEdit} />
                      </span>

                      <textarea
                        id="headline"
                        rows={3}
                        value={userData.headline}
                        onChange={handleStateChange}
                        className="w-full outline-none bg-transparent text-sm text-gray-700 resize-none"
                        placeholder="Your professional headline..."
                      />

                  </>
                ) : (
                  <>
                    <span className="flex gap-2">
                      <h2 className="font-bold text-2xl">{userData.name}</h2>
                      <button onClick={()=>{
                        setNameHeadLineEdit(true),
                        setIsEdited(true)
                      }}><Pencil isDisable={nameHeadlineEdit}/></button>
                    </span>
                    <p className="text-gray-600 text-sm whitespace-pre-wrap">{userData.headline ||"Your profesional headline"}</p>
                  </>
                )}
              </div>

              <button
                className="border-2 border-black px-6 rounded-md mt-3 
                disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white 
                disabled:hover:text-black hover:text-white hover:bg-black cursor-pointer"
                disabled={!isEdited||isLoading}
                type="button"
                onClick={handleSubmit}
              >
                Update changes
              </button>
            </div>
          </div>
        </div>
        {isLoading&&<LoadingBar />}

        {/* Section: About Me */}
        <Section title="About Me" onEdit={() => { setAboutEdit(true); setIsEdited(true); }} isEditing={aboutEdit}>
          {aboutEdit ? (
            <textarea
              id="about"
              rows={4}
              value={userData.about}
              onChange={handleStateChange}
              className="w-full border border-purple-500 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300 transition resize-none"
              placeholder="Tell us about yourself..."
            />
          ) : (
            <textarea readOnly value={userData.about || "Tell us about yourself"}  className="text-gray-800 text-sm whitespace-pre-wrap resize-none outline-0" />
          )}
        </Section>

        {/* Section: Contact Details */}
        <Section title="Contact Details" onEdit={() => { setContactEdit(true); setIsEdited(true); }} isEditing={contactEdit}>
          {contactEdit ? (
            <>
              <div className="w-[300px]">
                <PhoneInput
                  country={'in'}
                  value={phone}
                  id="phone"
                  onChange={handlePhoneChange}
                  inputStyle={{
                    width: '100%',
                    border: '1px solid #a855f7',
                    borderRadius: '0.375rem',
                    padding: '0.5rem 1rem',
                  }}
                  inputProps={{
                    name: 'phone',
                    required: true,
                  }}
                />
              </div>
              <p className="text-gray-800 text-sm">{userData.email}</p>
            </>
          ) : (
            <>
              <p className="text-gray-800 text-sm">{userData.phone||"Add your phone number here..."}</p>
              <p className="text-gray-800 text-sm">{userData.email|| "Email"}</p>
            </>
          )}
        </Section>

        {/* Skills Section */}
        <SkillSection skills={userData.skills} removeSkill={removeSkill} addSkill={addSkill} Edited={setIsEdited} />

       
         {/* Portfolio Section */}
        <Section
          title="Portfolio"
          onEdit={() => {
            setPortfolioEdit(true);
            setIsEdited(true);
          }}
          isEditing={portfolioEdit}
        >
          {portfolioEdit ? (
            userData.portfolio.map((item, idx) => (
              <div key={idx} className="flex gap-4 items-center">
                <input
                  type="text"
                  value={item.site}
                  onChange={(e) => handlePortfolioChange(idx, "site", e.target.value)}
                  className="w-1/6 border border-purple-500 outline-0 rounded-md px-3 py-2 focus:ring-purple-300 focus:ring-2"
                  placeholder="Site name"
                />
                <input
                  type="url"
                  value={item.url}
                  onChange={(e) => handlePortfolioChange(idx, "url", e.target.value)}
                  className="w-2/3 border border-purple-500 outline-0 rounded-md px-3 py-2 focus:ring-purple-300 focus:ring-2"
                  placeholder="https://example.com"
                />
              </div>
            ))
          ) : (
            userData.portfolio.map((item, idx) => (
              <div key={idx} className="flex gap-4 items-center">
                <p className="w-1/6 px-3 py-2 rounded-md border border-purple-200 bg-gray-50">
                  {item.site}
                </p>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-2/3 px-3 py-2 rounded-md border  border-purple-200 bg-gray-50 text-purple-700 "
                >
                  {item.url}
                </a>
              </div>
            ))
          )}

          {/* Add New Portfolio Button */}
          <button
            type="button"
            onClick={() => {
              const updated = [...userData.portfolio];
              updated.push({ site: "", url: "" });
              setUserData((prev) => ({ ...prev, portfolio: updated }));
              setIsEdited(true);
            }}
            className="text-purple-600 mt-2 font-bold w-full mx-auto"
          >
            <p className="cursor-pointer mt-2">+ Add New Link</p>
          </button>
        </Section>


        {/* Resume Upload Section */}
        <div className="px-6 pb-6 pt-4 rounded-xl shadow-md bg-white relative mt-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold text-gray-800">Resume</h1>
          </div>
          {userData.resume?.fileName ? (
            <div className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded-md">
              <p className="text-gray-800">{userData.resume.fileName}</p>
              <button
                type="button"
                onClick={() => {
                  setUserData((prev) => ({ ...prev, resume: "" }));
                  setResumeBlob(null);
                  setIsEdited(true);
                }}
                title="Remove Resume"
              >
                <Wrong />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <label htmlFor="resume-upload" className="cursor-pointer flex items-center gap-2 text-purple-600 hover:underline">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  hidden
                  id="resume-upload"
                  onChange={uploadResume}
                />
                📄 <span>Upload Resume</span>
              </label>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

// 🔧 Reusable Section Component
const Section = ({ title, onEdit, isEditing, children }) => (
  <div className="px-6 pb-6 pt-4 rounded-xl shadow-md bg-white relative mt-6">
    <div className="flex items-center justify-between mb-4">
      <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
      <div onClick={onEdit} className="cursor-pointer">
        <Pencil isDisable={isEditing} />
      </div>
    </div>
    <div className="flex flex-col gap-4">{children}</div>
  </div>
);

export default MyProfileForm; 