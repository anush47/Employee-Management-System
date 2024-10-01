export const handleCsvUpload = async (file: File): Promise<string> => {
  const reader = new FileReader();

  const result = await new Promise<string>((resolve, reject) => {
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result.toString());
      } else {
        reject(new Error("Failed to read file"));
      }
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsText(file);
  });

  //send to api to process and get the result

  return result;
};
