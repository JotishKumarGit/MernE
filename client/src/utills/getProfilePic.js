// utils.js or in the same component
const getProfilePic = (profilePic) => {
  const defaultPic = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

  if (!profilePic) return defaultPic;

  // If the profilePic is already a full URL, return as-is
  if (profilePic.startsWith("http://") || profilePic.startsWith("https://")) {
    return profilePic + `?t=${Date.now()}`; // add timestamp to avoid caching
  }

  // Otherwise, prepend API URL
  return `${import.meta.env.VITE_API_URL}${profilePic}?t=${Date.now()}`;
};

export default getProfilePic;