"use client";
import React, { useState } from "react";

// Icon Components (since they're imported in the original)
const Pencil = ({ isDisable }) => (
  <svg 
    className={`w-5 h-5 ${isDisable ? 'text-gray-400' : 'text-purple-600 hover:text-purple-700'}`}
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

const Wrong = () => (
  <svg className="w-5 h-5 text-red-500 hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const LoadingBar = () => (
  <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
    <div className="h-full bg-purple-600 rounded-full animate-pulse" style={{ width: '70%' }}></div>
  </div>
);

// Simplified SkillSection component
const SkillSection = ({ skills, removeSkill, addSkill, Edited }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newSkill, setNewSkill] = useState("");

  return (
    <div className="px-6 pb-6 pt-4 rounded-xl shadow-md bg-white relative mt-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-800">Skills</h1>
        <div onClick={() => { setIsEditing(!isEditing); Edited(true); }} className="cursor-pointer">
          <Pencil isDisable={isEditing} />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, idx) => (
          <div key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full flex items-center gap-2">
            <span>{skill}</span>
            {isEditing && (
              <button onClick={() => { removeSkill(skill); Edited(true); }} className="text-red-500 hover:text-red-600">
                ×
              </button>
            )}
          </div>
        ))}
        {isEditing && (
          <div className="flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && newSkill.trim()) {
                  addSkill(newSkill.trim());
                  setNewSkill("");
                  Edited(true);
                }
              }}
              placeholder="Add skill..."
              className="px-3 py-1 border border-purple-300 rounded-full outline-none focus:border-purple-500"
            />
          </div>
        )}
      </div>
    </div>
  );
};

const MyProfileForm = ({ user = {} }) => {
  const [userData, setUserData] = useState({
    name: user.name || "",
    phone: user.phone || "",
    headline: user.headline || "",
    avatarUrl: user.avatarUrl || "/api/placeholder/250/250",
    email: user.email || "",
    about: user.about || "",
    portfolio: user.portfolio || [],
    resume: user.resume || undefined,
    skills: user.skills || [],
    organizations: user.organizations || []
  });

  const [isEdited, setIsEdited] = useState(false);
  const [contactEdit, setContactEdit] = useState(false);
  const [aboutEdit, setAboutEdit] = useState(false);
  const [portfolioEdit, setPortfolioEdit] = useState(false);
  const [organizationsEdit, setOrganizationsEdit] = useState(false);
  const [showProfilePic, setShowProfilePic] = useState(user.avatarUrl || "/api/placeholder/250/250");
  const [nameHeadlineEdit, setNameHeadLineEdit] = useState(false);
  const [error, setError] = useState(false);
  const [phone, setPhone] = useState(userData.phone || "");
  const [isLoading, setIsLoading] = useState(false);

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

  const handleOrganizationChange = (index, field, value) => {
    const updated = [...userData.organizations];
    if (field === 'isCurrent' && value === true) {
      updated[index].endDate = "";
    }
    updated[index][field] = value;
    setUserData((prev) => ({ ...prev, organizations: updated }));
  };

  const addOrganization = () => {
    const newOrg = {
      name: "",
      jobTitle: "",
      startDate: "",
      endDate: "",
      isCurrent: false
    };
    setUserData((prev) => ({
      ...prev,
      organizations: [...prev.organizations, newOrg]
    }));
    setIsEdited(true);
    setOrganizationsEdit(true);
  };

  const calculateDuration = (startDate, endDate, isCurrent) => {
    if (!startDate) return "";
    
    const start = new Date(startDate);
    const end = isCurrent ? new Date() : (endDate ? new Date(endDate) : null);
    
    if (!end) return "";
    
    let months = (end.getFullYear() - start.getFullYear()) * 12;
    months += end.getMonth() - start.getMonth();
    
    if (end.getDate() < start.getDate()) {
      months--;
    }
    
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    let duration = "";
    if (years > 0) {
      duration += `${years} ${years === 1 ? 'year' : 'years'}`;
    }
    if (remainingMonths > 0) {
      if (duration) duration += ", ";
      duration += `${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`;
    }
    
    return duration || "Less than a month";
  };

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const removeOrganization = (index) => {
    const updated = userData.organizations.filter((_, idx) => idx !== index);
    setUserData((prev) => ({ ...prev, organizations: updated }));
    setIsEdited(true);
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

  const handlePhoneChange = (e) => {
    setPhone(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
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
      fd.append("organizations", JSON.stringify(userData.organizations));

      const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/user/update-profile`, {
        method: "POST",
        body: fd,
      });

      const data = await response.json();
      if (!data.success) {
        setError(data.error);
        setIsLoading(false);
        setIsEdited(false);
        return;
      }
      setIsEdited(false);
      setIsLoading(false);
      console.log("User Profile updated successfully");
    } catch (err) {
      console.error("Error submitting profile:", err);
      setError("Unexpected error occurred");
    }
  };

  return (
    <div className="pt-[66px] ml-[20vw] max-w-[55vw]">
      <div>
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
                      <button
                        type="button"
                        onClick={() => {
                          setNameHeadLineEdit(true);
                          setIsEdited(true);
                        }}
                      >
                        <Pencil isDisable={nameHeadlineEdit} />
                      </button>
                    </span>
                    <p className="text-gray-600 text-sm whitespace-pre-wrap">
                      {userData.headline || "Your professional headline"}
                    </p>
                  </>
                )}
              </div>

              <button
                className="border-2 border-black px-6 rounded-md mt-3 
                disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white 
                disabled:hover:text-black hover:text-white hover:bg-black cursor-pointer"
                disabled={!isEdited || isLoading}
                type="button"
                onClick={handleSubmit}
              >
                Update changes
              </button>
            </div>
          </div>
        </div>
        {isLoading && <LoadingBar />}

        {/* Section: About Me */}
        <Section
          title="About Me"
          onEdit={() => {
            setAboutEdit(true);
            setIsEdited(true);
          }}
          isEditing={aboutEdit}
        >
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
            <p className="text-gray-800 text-sm whitespace-pre-wrap">
              {userData.about || "Tell us about yourself"}
            </p>
          )}
        </Section>

        {/* Section: Contact Details */}
        <Section
          title="Contact Details"
          onEdit={() => {
            setContactEdit(true);
            setIsEdited(true);
          }}
          isEditing={contactEdit}
        >
          {contactEdit ? (
            <>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                className="w-[300px] border border-purple-500 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
                placeholder="Phone number"
              />
              <p className="text-gray-800 text-sm">{userData.email}</p>
            </>
          ) : (
            <>
              <p className="text-gray-800 text-sm">
                {userData.phone || "Add your phone number here..."}
              </p>
              <p className="text-gray-800 text-sm">{userData.email || "Email"}</p>
            </>
          )}
        </Section>

        {/* Organizations Section */}
        <Section
          title="Organizations"
          onEdit={() => {
            setOrganizationsEdit(true);
            setIsEdited(true);
          }}
          isEditing={organizationsEdit}
        >
          {userData.organizations.map((org, idx) => (
            <div key={idx} className="border border-purple-200 rounded-lg p-4 bg-gray-50">
              {organizationsEdit ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <input
                      type="text"
                      value={org.name}
                      onChange={(e) => handleOrganizationChange(idx, "name", e.target.value)}
                      className="flex-1 border border-purple-500 outline-0 rounded-md px-3 py-2 focus:ring-purple-300 focus:ring-2"
                      placeholder="Organization name"
                    />
                    <button
                      type="button"
                      onClick={() => removeOrganization(idx)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Wrong />
                    </button>
                  </div>
                  
                  <input
                    type="text"
                    value={org.jobTitle}
                    onChange={(e) => handleOrganizationChange(idx, "jobTitle", e.target.value)}
                    className="w-full border border-purple-500 outline-0 rounded-md px-3 py-2 focus:ring-purple-300 focus:ring-2"
                    placeholder="Job title"
                  />
                  
                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label className="text-sm text-gray-600 mb-1 block">Start Date</label>
                      <input
                        type="date"
                        value={org.startDate}
                        onChange={(e) => handleOrganizationChange(idx, "startDate", e.target.value)}
                        className="w-full border border-purple-500 outline-0 rounded-md px-3 py-2 focus:ring-purple-300 focus:ring-2"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <label className="text-sm text-gray-600 mb-1 block">End Date</label>
                      <input
                        type="date"
                        value={org.endDate}
                        onChange={(e) => handleOrganizationChange(idx, "endDate", e.target.value)}
                        disabled={org.isCurrent}
                        className="w-full border border-purple-500 outline-0 rounded-md px-3 py-2 focus:ring-purple-300 focus:ring-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`current-${idx}`}
                      checked={org.isCurrent || false}
                      onChange={(e) => handleOrganizationChange(idx, "isCurrent", e.target.checked)}
                      className="w-4 h-4 text-purple-600 border-purple-300 rounded focus:ring-purple-500"
                    />
                    <label htmlFor={`current-${idx}`} className="text-sm text-gray-700 cursor-pointer">
                      I currently work here
                    </label>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <h3 className="font-semibold text-gray-800">{org.name || "Organization Name"}</h3>
                    {org.isCurrent && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Current</span>
                    )}
                  </div>
                  <p className="text-gray-700 text-sm mb-1">{org.jobTitle || "Job Title"}</p>
                  {(org.startDate || org.endDate) && (
                    <p className="text-gray-600 text-xs">
                      {formatDate(org.startDate)} - {org.isCurrent ? "Present" : formatDate(org.endDate)}
                      {org.startDate && (org.endDate || org.isCurrent) && (
                        <span className="ml-2 text-purple-600">
                          ({calculateDuration(org.startDate, org.endDate, org.isCurrent)})
                        </span>
                      )}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
          
          {/* Add New Organization Button */}
          <button
            type="button"
            onClick={addOrganization}
            className="text-purple-600 mt-2 font-bold w-full mx-auto hover:text-purple-700 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Add New Organization</span>
          </button>
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
                  className="w-2/3 px-3 py-2 rounded-md border border-purple-200 bg-gray-50 text-purple-700"
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
                  setIsEdited(true);
                }}
                title="Remove Resume"
              >
                <Wrong />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <label
                htmlFor="resume-upload"
                className="cursor-pointer flex items-center gap-2 text-purple-600 hover:underline"
              >
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
      </div>
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