"use client";
import React, { useState } from "react";
import SkillSection from "./SkillSection";
// Icon Components
const Pencil = ({ isDisable }) => (
  <svg 
    className={`w-3 h-3 sm:w-5 sm:h-5 ${isDisable ? 'text-gray-400' : 'text-purple-600 hover:text-purple-700'}`}
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

// Success Message Component
const SuccessMessage = ({ message }) => (
  <div className="mx-6 mb-4 p-3 bg-green-50 border border-green-300 text-green-700 rounded-md flex items-center gap-2">
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    {message}
  </div>
);

// Error Message Component
const ErrorMessage = ({ error }) => (
  <div className="mx-6 mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded-md flex items-center gap-2">
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    {error}
  </div>
);



const MyProfileForm = ({ user = {} }) => {
  const [userData, setUserData] = useState({
    name: user.name || "",
    phone: user.phone || "",
    headline: user.headline || "",
    avatarUrl: user.avatarUrl || "/api/placeholder/250/250",
    email: user.email || "",
    about: user.about || "",
    portfolio: user.portfolio || [],
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
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [phone, setPhone] = useState(userData.phone || "");
  const [isLoading, setIsLoading] = useState(false);
  const [portfolioErrors, setPortfolioErrors] = useState({});

  const handleStateChange = (e) => {
    const field = e.target.id;
    const value = e.target.value;
    setUserData((prev) => ({ ...prev, [field]: value }));
    setError(""); // Clear error on change
  };

  const handlePortfolioChange = (index, field, value) => {
    const updated = [...userData.portfolio];
    updated[index][field] = value;
    setUserData((prev) => ({ ...prev, portfolio: updated }));
    
    // Validate portfolio field
    const errors = { ...portfolioErrors };
    if (!value?.trim()) {
      if (!errors[index]) errors[index] = {};
      errors[index][field] = `${field} is required`;
    } else {
      if (field === 'url') {
        // Basic URL validation
        try {
          new URL(value.trim());
          if (errors[index]?.url) delete errors[index].url;
        } catch {
          if (!errors[index]) errors[index] = {};
          errors[index].url = 'Please enter a valid URL';
        }
      } else {
        if (errors[index]?.[field]) delete errors[index][field];
      }
      if (errors[index] && Object.keys(errors[index]).length === 0) {
        delete errors[index];
      }
    }
    setPortfolioErrors(errors);
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
    // Check if there are empty organizations
    const hasEmptyOrg = userData.organizations.some(
      org => !org.name?.trim() || !org.jobTitle?.trim()
    );
    
    if (hasEmptyOrg) {
      setError("Please complete existing organizations before adding new ones");
      return;
    }
    
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
    setError("");
  };

  const addPortfolioItem = () => {
    // Check if there are empty portfolio items
    const hasEmptyItem = userData.portfolio.some(
      item => !item.site?.trim() || !item.url?.trim()
    );
    
    if (hasEmptyItem) {
      setError("Please complete existing portfolio items before adding new ones");
      return;
    }
    
    const updated = [...userData.portfolio];
    updated.push({ site: "", url: "" });
    setUserData((prev) => ({ ...prev, portfolio: updated }));
    setPortfolioEdit(true);
    setIsEdited(true);
    setError("");
  };

  const removePortfolioItem = (index) => {
    const updated = userData.portfolio.filter((_, i) => i !== index);
    setUserData((prev) => ({ ...prev, portfolio: updated }));
    
    // Clean up errors for removed item
    const errors = { ...portfolioErrors };
    delete errors[index];
    // Reindex errors
    const newErrors = {};
    Object.keys(errors).forEach(key => {
      const numKey = parseInt(key);
      if (numKey > index) {
        newErrors[numKey - 1] = errors[key];
      } else {
        newErrors[key] = errors[key];
      }
    });
    setPortfolioErrors(newErrors);
    setIsEdited(true);
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
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate image file
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      e.target.value = '';
      return;
    }
    
    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Image size must be less than 5MB');
      e.target.value = '';
      return;
    }
    
    setError("");
    setIsEdited(true);
    const imageUrl = URL.createObjectURL(file);
    setShowProfilePic(imageUrl);
    setUserData((prev) => ({ ...prev, avatarUrl: file }));
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
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setError("");
      setSuccessMessage("");
      
      // Validate required fields
      if (!userData.name?.trim()) {
        setError("Name is required");
        setIsLoading(false);
        return;
      }
      
      // Clean and validate data
      const validPortfolio = userData.portfolio.filter(item => 
        item.site?.trim() && item.url?.trim()
      );
      
      const validOrganizations = userData.organizations.filter(org =>
        org.name?.trim() && org.jobTitle?.trim() && org.startDate
      );
      
      const fd = new FormData();
      fd.append("name", userData.name.trim());
      fd.append("phone", phone);
      fd.append("headline", userData.headline);
      fd.append("email", userData.email);
      fd.append("about", userData.about);
      
      // Handle avatar
      if (userData.avatarUrl instanceof File) {
        fd.append("avatarUrl", userData.avatarUrl);
      } else {
        fd.append("avatarUrl", userData.avatarUrl || '');
      }
      
      fd.append("skills", JSON.stringify(userData.skills));
      fd.append("portfolio", JSON.stringify(validPortfolio));
      fd.append("organizations", JSON.stringify(validOrganizations));

      const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/user/update-profile`, {
        method: "POST",
        body: fd,
      });

      const data = await response.json();
      
      if (!data.success) {
        setError(data.error || 'Failed to update profile');
        setIsLoading(false);
        return;
      }
      
      // Update state with cleaned data and server response
      setUserData(prev => ({
        ...prev,
        portfolio: validPortfolio,
        organizations: validOrganizations,
        avatarUrl: data.data?.avatarUrl || prev.avatarUrl
      }));
      
      // Update profile pic if new URL from server
      if (data.data?.avatarUrl && typeof data.data.avatarUrl === 'string') {
        setShowProfilePic(data.data.avatarUrl);
      }
      
      setIsEdited(false);
      setIsLoading(false);
      setSuccessMessage("Profile updated successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      
    } catch (err) {
      console.error("Error submitting profile:", err);
      setError("Unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-[66px] ml-[5vw] lg:ml-[20vw] max-w-[55vw]">
      <div>
        {/* Top Profile Section */}
        <div className="sm::relative sm:-translate-y-1/4 flex max-sm:flex-col gap-8 max-sm:w-[150px] w-full">
          <div className="relative">
            <img
              src={showProfilePic}
              height={250}
              width={250}
              className="rounded-3xl w-[150px] md:w-[200px] lg:w-[250px] object-cover"
              alt="profile pic"
            />
            <div className="absolute top-2 right-2 sm:right-4 cursor-pointer">
              <label htmlFor="avatarUrl" className="cursor-pointer bg-white rounded-full p-2 shadow-md block">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  hidden
                  id="avatarUrl"
                  onChange={handleChangeImage}
                />
                <Pencil isDisable={false} />
              </label>
            </div>
          </div>
          <div className="sm:relative">
            <div className="sm:absolute sm:bottom-0 max-sm:w-[80vw] w-[450px]">
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
                      <div onClick={() => setNameHeadLineEdit(false)} className="cursor-pointer">
                        <Pencil isDisable={nameHeadlineEdit} />
                      </div>
                    </span>

                    <textarea
                      id="headline"
                      rows={3}
                      value={userData.headline}
                      onChange={handleStateChange}
                      className="w-full outline-none bg-transparent  text-sm text-gray-700 resize-none"
                      placeholder="Your professional headline..."
                    />
                  </>
                ) : (
                  <>
                    <span className="flex gap-2">
                      <h2 className="font-bold text-2xl">{userData.name || "Your Name"}</h2>
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
                    <p className="text-gray-600 text-sm whitespace-break-spaces ">
                      {userData.headline || "Your professional headline"}
                    </p>
                  </>
                )}
              </div>

              <button
                className="border-2 border-black px-6 py-2 rounded-md mt-3 
                disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white 
                disabled:hover:text-black hover:text-white hover:bg-black cursor-pointer transition-colors"
                disabled={!isEdited || isLoading}
                type="button"
                onClick={handleSubmit}
              >
                {isLoading ? "Updating..." : "Update changes"}
              </button>
            </div>
          </div>
        </div>
        
        {isLoading && <LoadingBar />}
        {error && <ErrorMessage error={error} />}
        {successMessage && <SuccessMessage message={successMessage} />}

        {/* Section: About Me */}
        <Section
          title="About Me"
          onEdit={() => {
            setAboutEdit(!aboutEdit);
            if (aboutEdit) {
              setIsEdited(true);
            }
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
            setContactEdit(!contactEdit);
            if (contactEdit) {
              setIsEdited(true);
            }
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
            setOrganizationsEdit(!organizationsEdit);
            if (organizationsEdit) {
              setIsEdited(true);
            }
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
          
          <button
            type="button"
            onClick={addOrganization}
            className="text-purple-600 mt-2 font-bold w-full mx-auto hover:text-purple-700 flex items-center justify-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="max-sm:text-sm">Add New Organization</span>
          </button>
        </Section>

        {/* Skills Section */}
        <SkillSection 
          skills={userData.skills} 
          removeSkill={removeSkill} 
          addSkill={addSkill} 
          Edited={setIsEdited} 
        />

        {/* Portfolio Section */}
        <Section
          title="Portfolio"
          onEdit={() => {
            setPortfolioEdit(!portfolioEdit);
            if (portfolioEdit) {
              setIsEdited(true);
            }
          }}
          isEditing={portfolioEdit}
        >
          {portfolioEdit ? (
            <>
              {userData.portfolio.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex gap-4 items-start">
                    <div className="w-1/4">
                      <input
                        type="text"
                        value={item.site}
                        onChange={(e) => handlePortfolioChange(idx, "site", e.target.value)}
                        className={`w-full border ${
                          portfolioErrors[idx]?.site ? 'border-red-500' : 'border-purple-500'
                        } outline-0 rounded-md max-sm:px-1 px-3 max-sm:py-1 py-2 focus:ring-2 max-sm:text-xs ${
                          portfolioErrors[idx]?.site ? 'focus:ring-red-300' : 'focus:ring-purple-300'
                        }`}
                        placeholder="Site name"
                      />
                      {portfolioErrors[idx]?.site && (
                        <p className="text-red-500 text-xs mt-1">{portfolioErrors[idx].site}</p>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="url"
                        value={item.url}
                        onChange={(e) => handlePortfolioChange(idx, "url", e.target.value)}
                        className={`w-full border ${
                          portfolioErrors[idx]?.url ? 'border-red-500' : 'border-purple-500'
                        } outline-0 rounded-md max-sm:px-1 px-3 max-sm:py-1 py-2 focus:ring-2 max-sm:text-xs ${
                          portfolioErrors[idx]?.url ? 'focus:ring-red-300' : 'focus:ring-purple-300'
                        }`}
                        placeholder="https://example.com"
                      />
                      {portfolioErrors[idx]?.url && (
                        <p className="text-red-500 text-xs mt-1">{portfolioErrors[idx].url}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removePortfolioItem(idx)}
                      className="max-sm:p-1 p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Wrong />
                    </button>
                  </div>
                </div>
              ))}
            </>
          ) : (
            userData.portfolio.map((item, idx) => (
              <div key={idx} className="flex gap-4 items-center">
                <p className="w-1/4 max-sm:px-1 px-3 max-sm:py-1 py-2 rounded-md border border-purple-200 bg-gray-50 max-sm:text-xs">
                  {item.site}
                </p>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 max-sm:px-1 px-3 max-sm:py-1 max-sm:text-xs py-2 rounded-md border border-purple-200 bg-gray-50 text-purple-700 hover:bg-purple-50 transition-colors"
                >
                  {item.url}
                </a>
              </div>
            ))
          )}

          <button
            type="button"
            onClick={addPortfolioItem}
            className="text-purple-600 mt-2 font-bold w-full mx-auto hover:text-purple-700 transition-colors"
          >
            <p className="cursor-pointer mt-2 max-sm:text-sm">+ Add New Link</p>
          </button>
        </Section>
      </div>
    </div>
  );
};

// Reusable Section Component
const Section = ({ title, onEdit, isEditing, children }) => (
  <div className="px-3 sm:px-6 pb-3 sm:pb-6 sm:pt-2 pt-4 rounded-xl shadow-md  bg-white relative mt-6 max-lg:w-[90vw]">
    <div className="flex items-center justify-between mb-4">
      <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">{title}</h1>
      <div onClick={onEdit} className="cursor-pointer">
        <Pencil isDisable={isEditing} />
      </div>
    </div>
    <div className="flex flex-col gap-4">{children}</div>
  </div>
);

export default MyProfileForm;