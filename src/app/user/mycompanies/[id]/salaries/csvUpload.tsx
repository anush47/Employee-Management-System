export const handleCsvUpload = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      // Resolving the file content as a string
      if (event.target?.result) {
        resolve(event.target.result.toString());
      } else {
        reject(new Error("Failed to read file"));
      }
    };

    reader.onerror = (error) => {
      reject(error);
    };

    // Read the file as text
    reader.readAsText(file);
  });
};
