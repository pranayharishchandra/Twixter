import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const useUpdateUserProfile = () => {
	const queryClient = useQueryClient();

	const { mutateAsync: updateProfile, isPending: isUpdatingProfile } = useMutation({

		mutationFn: async (formData) => {
			try {
				const res = await fetch(`/api/users/update`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(formData),
				});

				const data = await res.json();
				
				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}
				return data;
			} 
			catch (error) {
				throw new Error(error.message);
			}
		},
		onSuccess: () => {
			toast.success("Profile updated successfully");
			Promise.all([
				queryClient.invalidateQueries({ queryKey: ["authUser"] }),
				queryClient.invalidateQueries({ queryKey: ["userProfile"] }),
			]);
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	return { updateProfile, isUpdatingProfile };
};

export default useUpdateUserProfile;

/**
** Note: Using `Promise.all` is fine but not necessary here - as "invalidateQueries" is sync operation
Promise.all([
	queryClient.invalidateQueries({ queryKey: ["authUser"] }),
	queryClient.invalidateQueries({ queryKey: ["userProfile"] }),
]);

** No need of new Error
catch (error) {
	// throw new Error(error.message);
	throw Error(error.message); // Directly throwing error
} 

 */