'use client';

const FormField = ({ type, title, state, placeholder, isTextArea, setState }) => {
  return (
    <div className="flex flex-col w-full sm:px-4 my-1 sm:my-3">
      <label className="w-full mb-1">{title}</label>

      {isTextArea ? (
        <textarea
          placeholder={placeholder}
          value={state}
          className="border-2 border-gray-200  rounded-md max-sm:text-sm px-4 py-3 outline-0"
          onChange={(e) => setState(e.target.value)}
        />
      ) : (
        <input
          type={type || 'text'}
          placeholder={placeholder}
          required
          value={state}
          className="border-2 border-gray-200 rounded-md max-sm:text-sm  px-4 py-3 outline-0"
          onChange={(e) => setState(e.target.value)}
        />
      )}
    </div>
  );
};

export default FormField;
