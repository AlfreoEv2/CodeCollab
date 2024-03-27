import axios from "axios";

export const createFile = async (filename: string, parentFolderId: string) => {
  try {
    const response = await axios.post(
      "https://codecollab-m571.onrender.com/files/",
      {
        filename,
        content: [],
        parentFolder: parentFolderId,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating file:", error);
    throw error;
  }
};

export const deleteFile = async (fileId: string) => {
  try {
    console.log("We called the Delete API");
    await axios.delete(`https://codecollab-m571.onrender.com/files/${fileId}`);
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
};

export const renameFile = async (fileId: string, newFilename: string) => {
  try {
    const response = await axios.patch(
      `https://codecollab-m571.onrender.com/files/${fileId}`,
      {
        newFilename,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error renaming file:", error);
    throw error;
  }
};
