"use client";

import Image from "next/image";
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";

import FormField from "./FormField";
import Button from "./Button";
import CustomMenu from "./CustomMenu";
import { categoryFilters } from "../constants/data";
import { updateProject, createNewProject } from "../lib/actions/actions";

const ProjectForm = ({ type, project }) => {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);
  const [isNewImage, setIsNewImage] = useState(false);

  const [form, setForm] = useState({
    title: project?.title || "",
    description: project?.description || "",
    poster: project?.poster||null,
    liveSiteUrl: project?.liveSiteUrl || "",
    githubUrl: project?.githubUrl || "",
    category: project?.category || "",
  });

  const [imagePreview, setImagePreview] = useState(project?.poster || "");

  const handleStateChange = (fieldName, value) => {
    setForm((prevForm) => ({ ...prevForm, [fieldName]: value }));
  };

  const handleChangeImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes("image")) {
      alert("Please upload a valid image!");
      return;
    }

    handleStateChange("poster", file);
    setImagePreview(URL.createObjectURL(file));
    setIsNewImage(true);
    fileInputRef.current.value = ""; // Reset so same file can be reselected
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (type === "create") {
        const formData = new FormData();
        formData.append("title", form.title);
        formData.append("description", form.description);
        formData.append("liveSiteUrl", form.liveSiteUrl);
        formData.append("githubUrl", form.githubUrl);
        formData.append("category", form.category);
        formData.append("poster", form.poster); // new Blob

        await createNewProject(formData);
      }

      if (type === "edit") {
        console.log("edittt")
        const formData = new FormData();
        formData.append("title", form.title);
        formData.append("description", form.description);
        formData.append("liveSiteUrl", form.liveSiteUrl);
        formData.append("githubUrl", form.githubUrl);
        formData.append("category", form.category);

        formData.append("poster", form.poster);
        

        await updateProject(formData, project?._id,isNewImage);
      }

      router.push("/");
    } catch (error) {
      alert(`Failed to ${type === "create" ? "create" : "edit"} the project.`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      
      className="flex flex-col overflow-y-scroll max-h-[75vh] gap-3 sm:gap-6 p-3 sm:p-6 w-full"
    >
      {/* Poster Upload */}
      <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md  min-h-[200px]">
        <input
          ref={fileInputRef}
          id="poster"
          type="file"
          accept="image/*"
          required={type === "create"}
          className="hidden"
          onChange={handleChangeImage}
        />

        {!imagePreview && (
          <label htmlFor="poster" className="text-gray-400 cursor-pointer text-sm">
            Choose a poster for your project
          </label>
        )}

        {imagePreview && (
          <div
            className="relative w-full h-[250px]  cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Image
              src={imagePreview}
              alt="project poster"
              fill
              className="object-contain rounded-md"
            />
            <div className="absolute w-full h-full bg-black/50 flex justify-center items-center"><p className="text-white">Edit image</p></div>
          </div>
        )}
      </div>

      {/* Form Fields */}
      <FormField
        title="Title"
        state={form.title}
        placeholder="Your project title"
        setState={(value) => handleStateChange("title", value)}
      />

      <FormField
        title="Description"
        isTextArea
        state={form.description}
        placeholder="Brief description of the project"
        setState={(value) => handleStateChange("description", value)}
      />

      <FormField
        type="url"
        title="Website URL"
        state={form.liveSiteUrl}
        placeholder="https://yourwebsite.com"
        setState={(value) => handleStateChange("liveSiteUrl", value)}
      />

      <FormField
        type="url"
        title="GitHub URL"
        state={form.githubUrl}
        placeholder="https://github.com/your-repo"
        setState={(value) => handleStateChange("githubUrl", value)}
      />

      <CustomMenu
        title="Category"
        state={form.category}
        filters={categoryFilters}
        setState={(value) => handleStateChange("category", value)}
      />

      <div className="flex justify-start sm:mt-4" onClick={handleFormSubmit}>
        <Button
          title={
            submitting
              ? `${type === "create" ? "Creating..." : "Editing..."}`
              : `${type === "create" ? "Create" : "Edit"}`
          }
          submitting={submitting}
          leftIcon={submitting ? "" : "/plus.svg"}
        />
      </div>
    </form>
  );
};

export default ProjectForm;
