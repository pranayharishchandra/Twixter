import { Link } from "react-router-dom";
import { useState } from "react";

import XSvg from "../../../components/svgs/X";

import { MdOutlineMail } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { MdPassword } from "react-icons/md";
import { MdDriveFileRenameOutline } from "react-icons/md";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const SignUpPage = () => {
	const [formData, setFormData] = useState({
		email: "",
		username: "",
		fullName: "",
		password: "",
	});

	const queryClient = useQueryClient();

	const { mutate: signUpMutation, isError, isPending, error }
		= useMutation({
			mutationFn: async ({ email, username, fullName, password }) => {
				try {
					const res = await fetch("/api/auth/signup", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ email, username, fullName, password }),
					});

					const data = await res.json();
					if (!res.ok) throw new Error(data.error || "Failed to create account");
					console.log(data);
					return data;
				}
				catch (error) {
					console.error(error);
					throw error;
				}
			},
			onSuccess: () => {
				toast.success("Account created successfully");

				queryClient.invalidateQueries({ queryKey: ["authUser"] });
				// invalidateQueries: https://youtu.be/r8Dg0KVnfMA?t=2201
				// queryClient.invalidateQueries({ queryKey: ["authUser"] }, {exact : true}); // now only ["authUser"] will be rejected and eg: ["authUser", 1] will not be re-fetched and it's data will become "stale" after 
			},
		});

	const handleSubmit = (e) => {
		e.preventDefault();
		signUpMutation(formData);
	};

	const handleInputChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	return (
		<div className='max-w-screen-xl mx-auto flex h-screen px-10'>

			<div className='flex-1 hidden lg:flex items-center  justify-center'>
				<XSvg className='lg:w-2/3 fill-white' />
			</div>

			<div className='flex-1 flex flex-col justify-center items-center'>

				<form className='lg:w-2/3  mx-auto md:mx-20 flex gap-4 flex-col' onSubmit={handleSubmit}>

					<XSvg className='w-24 lg:hidden fill-white' />
					<h1 className='text-4xl font-extrabold text-white'>Join today.</h1>
					<label className='input input-bordered rounded flex items-center gap-2'>
						<MdOutlineMail />
						<input
							type        = 'email'
							className   = 'grow'
							placeholder = 'Email'
							name        = 'email'
							onChange    = {handleInputChange}
							value       = {formData.email}
						/>
					</label>

					<div className='flex gap-4 flex-wrap'>
						<label className='input input-bordered rounded flex items-center gap-2 flex-1'>
							<FaUser />
							<input
								type        = 'text'
								className   = 'grow '
								placeholder = 'Username'
								name        = 'username'
								onChange    = {handleInputChange}
								value       = {formData.username}
							/>
						</label>
						<label className='input input-bordered rounded flex items-center gap-2 flex-1'>
							<MdDriveFileRenameOutline />
							<input
								type        = 'text'
								className   = 'grow'
								placeholder = 'Full Name'
								name        = 'fullName'
								onChange    = {handleInputChange}
								value       = {formData.fullName}
							/>
						</label>
					</div>

					<label className='input input-bordered rounded flex items-center gap-2'>
						<MdPassword />
						<input
							type        = 'password'
							className   = 'grow'
							placeholder = 'Password'
							name        = 'password'
							onChange    = {handleInputChange}
							value       = {formData.password}
						/>
					</label>

					<button className='btn rounded-full btn-primary text-white'>
						{isPending ? "Loading..." : "Sign up"}
					</button>

					{/* error message - eg: password must be 8 digits or
													(login)	incorrect username or password */}
					{isError && <p className='text-red-500'>{error.message}</p>}
					
				</form>

				<div className='flex flex-col lg:w-2/3 gap-2 mt-4'>
					<p className='text-white text-lg'>Already have an account?</p>
					<Link to='/login'>
						<button className='btn rounded-full btn-primary text-white btn-outline w-full'>Sign in</button>
					</Link>
				</div>

			</div>
		</div>
	);
};
export default SignUpPage;

/*

*useQuery:
Used to fetch data and manage the data fetching lifecycle (loading, error, success).
Syntax: useQuery(queryKey, queryFn, options).
Example: const { data, isLoading, error } = useQuery('posts', fetchPosts);.

*useQueryClient:
Provides access to the Query Client instance used to interact with the cache.
Useful for invalidating queries, updating the cache, and other advanced operations.
Syntax: const queryClient = useQueryClient();.
Example: queryClient.invalidateQueries('posts');.


* ============ 2. res.ok: Why are we using this? ============
Yes, you are correct. The res.ok property is used because the Fetch API does not throw an error for HTTP error statuses (e.g., 404, 500). Instead, you need to check the response status manually.

res.ok:
* A boolean property that is true if the HTTP status code is in the range 200-299.
Helps to determine if the request was successful.
if (!res.ok) {
	throw new Error(data.error || "Something went wrong");
}

* ============ 3. onSuccess function in useMutation hook: When does it run?
Yes, the onSuccess function in the 
* useMutation hook will run 
when the mutationFn completes successfully 
* without throwing any errors.

onSuccess:
-	Called if the mutation is successful.
-	Used to perform side effects, such as invalidating queries or showing a success message.

* ============ 4. What happens after login?
After the login mutation succeeds, the onSuccess function is executed. 
In this case, it invalidates the authUser query, which causes React Query to refetch the authenticated user data.

* Here's what happens step-by-step:
- Submit Form      : User submits the login form.
- Trigger Mutation : loginMutation is called with the form data.
- Mutation Function: The mutation function (mutationFn) sends a POST request to /api/auth/login with the username and password.
- Handle Response  : If the response is successful (res.ok), the mutation completes.
- On Success       : The onSuccess function invalidates the authUser query, prompting React Query to refetch the authenticated user data.
- UI Update        : The UI updates based on the new authUser data, likely redirecting the user to a protected route or updating the display to show the logged-in state.


* ============ useQuery and useMutation - fetching
*1. useQuery
Automatic Retries: By default, useQuery will retry failed requests up to 3 times.
Configuration: You can customize this behavior using the retry option.

* Example:
const { data, error, isLoading } = useQuery('fetchData', fetchDataFunction, {
	retry: 5, // Retry failed requests up to 5 times
});

*2. useMutation
Automatic Retries: useMutation does not retry by default, but you can configure it to retry failed requests.
Configuration: You can specify the retry option to control the number of retries.

* Example:
const { mutate, error, isLoading } = useMutation(mutationFunction, {
	retry: 3, // Retry failed mutation up to 3 times
});

 */