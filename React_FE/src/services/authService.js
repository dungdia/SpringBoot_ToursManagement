import baseUrl from "@/api/instance";

const login = async (formData) => {
   const response = await baseUrl.post("/auth/login", formData);
   return response.data;
};

const register = async (formData) => {
   const response = await baseUrl.post("/auth/register", formData);
   console.log("response: ", response);

   return response.data;
};

const loginWithGoogle = async (email, name) => {
   const response = await baseUrl.post("/auth/google-login", { email, name });
   return response.data;
};

const loginWithFacebook = async (email, name) => {
   const response = await baseUrl.post("/auth/facebook-login", { email, name });
   return response.data;
};
export { login, register, loginWithGoogle, loginWithFacebook };
