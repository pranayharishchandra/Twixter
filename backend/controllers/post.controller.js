import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";

/* //*NOTE
save(): This method is typically used when you've made changes to a document instance that's been fetched into application memory. Since updateOne modifies the database directly, calling save() isn't needed.
 */


export const createPost = async (req, res) => {
	try {
		const { text } = req.body;
		let   { img }  = req.body;
		const userId   = req.user._id.toString();
		//?  converting userId to a string "is not compulsory" when using findById. Mongoose can handle ObjectId types directly. You can simplify your code by removing the .toString() conversion:

		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ message: "User not found" });

		if (!text && !img) {
			return res.status(400).json({ error: "Post must have text or image" });
		}

		if (img) {
			const uploadedResponse = await cloudinary.uploader.upload(img);
			      img              = uploadedResponse.secure_url;
		}

		const newPost = new Post({
			user: userId,
			text,
			img,
		});

		await newPost.save();
		res.status(201).json(newPost);
	} catch (error) {
		res.status(500).json({ error: "Internal server error" });
		console.log("Error in createPost controller: ", error);
	}
};

export const deletePost = async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);
		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		if (post.user.toString() !== req.user._id.toString()) {
			return res.status(401).json({ error: "You are not authorized to delete this post" });
		}

		if (post.img) {
			const imgId = post.img.split("/").pop().split(".")[0];
			await cloudinary.uploader.destroy(imgId);
		}

		await Post.findByIdAndDelete(req.params.id);

		res.status(200).json({ message: "Post deleted successfully" });
	} catch (error) {
		console.log("Error in deletePost controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const commentOnPost = async (req, res) => {
	try {
		const { text } = req.body;			// extracing only the text field be de-structuring from the object req.body
		const postId   = req.params.id; // the post over which comment is being done
		const userId   = req.user._id;  // user who is writing comment - if user account delete (post deleted)

		if (!text) {
			return res.status(400).json({ error: "Text field is required" });
		}
		const post = await Post.findById(postId);

		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		const comment = { user: userId, text };

		post.comments.push(comment);
		await post.save(); //* document instance. Any changes you make to this instance need to be saved back to the database using the save()

		res.status(200).json(post);
	} catch (error) {
		console.log("Error in commentOnPost controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const likeUnlikePost = async (req, res) => {
	try {
		const userId         = req.user._id; // my (the user seeing post) id
		const { id: postId } = req.params;   // the post i am linking

		const post = await Post.findById(postId); // if that post (since we are taking from URL so must be verified)

		if (!post) { // if that really exists then very good otherwise post not found
			return res.status(404).json({ error: "Post not found" });
		}

		const userLikedPost = post.likes.includes(userId); 
		//* "true" if post already liked
		// if i had already liked the post, so now it should get disliked

		if (userLikedPost) {
		//* Unlike post
			await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
			await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

			//*: (either Fetch the updated post to get the new likes array) OR (filter like you are doing)
			//* const updatedPost = await Post.findById(postId);

			const updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString());
			res.status(200).json(updatedLikes); //* i could have sent only the post 
		} 
		else {  
		//* Like post
			post.likes.push(userId);
			await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
			await post.save();

			const notification = new Notification({
				from: userId,
				to  : post.user,
				type: "like",
			});

			/* // TODO: notification of linking the post should be sent in "real-time" using "Socket.io" along with DB 
			io.to(post.user).emit('notification', { type: 'like', from: userId, post: postId });

			*/
			await notification.save();

			const updatedLikes = post.likes;
			res.status(200).json(updatedLikes);
		}
	} catch (error) {
		console.log("Error in likeUnlikePost controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getAllPosts = async (req, res) => {
	try {
		const posts = await Post.find()
			.sort({ createdAt: -1 })
			.populate({
				path  : "user",
				select: "-password",
			})
			.populate({
				path  : "comments.user",
				select: "-password",
			});

		if (posts.length === 0) {
			return res.status(200).json([]);
		}

		res.status(200).json(posts);
	} catch (error) {
		console.log("Error in getAllPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

//  POST 
//  /api/posts/likes/:id
//  finds all posts whose IDs are in the likedPosts array of the user
export const getLikedPosts = async (req, res) => {
	const userId = req.params.id;

	try {
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: "User not found" });

		const likedPosts = await Post.find({ _id: { $in: user.likedPosts } }) // finds all posts whose IDs are in the likedPosts array of the user
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

export const getFollowingPosts = async (req, res) => {
	try {
		const userId = req.user._id; 								//1. my id
		const user   = await User.findById(userId); //2. getting all info about me 
		if (!user) return res.status(404).json({ error: "User not found" });

		const following = user.following; 					//3. all the users(userIds) i am following, array[]

		const feedPosts = await Post.find({ user: { $in: following } }) // 4. posts only by the user i follow
			.sort({ createdAt: -1 })                   //5. results are sorted in descending order by the createdAt field to show the most recent posts first
			.populate({      													 //6. details of the author of that post 
				path  : "user",
				select: "-password",
			})
			.populate({                       		    //7. info of all users commented on that post 
				path  : "comments.user",
				select: "-password",
			});

		res.status(200).json(feedPosts);
	} catch (error) {
		console.log("Error in getFollowingPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getUserPosts = async (req, res) => {
	try {
		const { username } = req.params; // some user 

		const user = await User.findOne({ username });
		if (!user) return res.status(404).json({ error: "User not found" });

		const posts = await Post.find({ user: user._id }) //1. checking the post by that user 
			.sort({ createdAt: -1 })											 //2. in decending order (latest first)
			.populate({																		//3. user is a field refering to "User", populating it
				path  : "user",
				select: "-password",
			})
			.populate({																	//4. all info of user commented on that post
				path  : "comments.user",
				select: "-password",
			});

		res.status(200).json(posts);
	} catch (error) {
		console.log("Error in getUserPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};
