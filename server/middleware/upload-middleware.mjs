import uploadStorage from "./multer-middleware.mjs";

const upload = uploadStorage.array('media', 10);

export default upload;