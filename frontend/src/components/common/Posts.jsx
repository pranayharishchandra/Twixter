import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

const Posts = ({ feedType, username, userId }) => {

	const getPostEndpoint = () => {
		switch (feedType) {

			case "forYou"   : return "/api/posts/all";								// all posts

			case "following": return "/api/posts/following";					// only of the users i am following

			case "posts"    : return `/api/posts/user/${username}`;		// posts from a perticular user

			case "likes"    : return `/api/posts/likes/${userId}`;		// finds all posts whose IDs are in the likedPosts array of the user.
			default					: return "/api/posts/all";								// all posts
		}
	};

	const POST_ENDPOINT = getPostEndpoint();

	const { data: posts, isLoading, refetch, isRefetching, } = useQuery({
		queryKey: ["posts"],
		queryFn: async () => {
			try {
				const res  = await fetch(POST_ENDPOINT);
				const data = await res.json();

				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}

				return data;
			} 
			catch (error) {
				throw new Error(error);
			}
		},
	});

	useEffect(() => {
		refetch();
	}, [feedType, refetch, username]);

	// if more than 0 post - show post, else show "No Posts"
	return (
		<>
			{/* shimmer if fetching or re-fetching - show shimmer */}
			{(isLoading || isRefetching) && (
				<div className='flex flex-col justify-center'>
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}

			{/* if fetching and re-fetching is completed then if we have found there is no posts i.e. posts?.length === 0 then show message no posts */}
			{!isLoading && !isRefetching && posts?.length === 0 && (
				<p className='text-center my-4'>No posts</p>
			)}

			
			{/* if there are more than 0 posts then show the posts */}
			{!isLoading && !isRefetching && posts && (
				<div>
					{posts.map((post) => (
						<Post key={post._id} post={post} />
					))}
				</div>
			)}
		</>
	);
};
export default Posts;


/** 
// /api/posts/likes/${userId}
export const getLikedPosts = async (req, res) => {
	const userId = req.params.id;

	try {
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: "User not found" });

		const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
			.populate({
				path  : "user",
				select: "-password",
			})
			.populate({
				path  : "comments.user",
				select: "-password",
			});

		res.status(200).json(likedPosts);
	} 
	catch (error) {
		console.log("Error in getLikedPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};
 */