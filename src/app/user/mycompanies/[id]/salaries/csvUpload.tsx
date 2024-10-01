export const handleCsvUpload = async (file: File): Promise<string> => {
  try {
    const reader = new FileReader();

    const result = await new Promise<string>((resolve, reject) => {
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result.toString());
        } else {
          reject(new Error("Failed to read the file content"));
        }
      };

      reader.onerror = () => {
        reject(new Error("An error occurred while reading the file"));
      };

      reader.readAsText(file);
    });

    // Send to API to process inOut
    const response = await fetch("/api/salaries/initialInOut", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inOut: result }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `API error: ${response.status} - ${
          errorData.message || "Unknown error"
        }`
      );
    }

    const data = await response.json();
    return data.inOutInitial;
  } catch (error) {
    console.error("Error during file upload or processing:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "An unexpected error occurred during file upload or processing"
    );
  }
};
