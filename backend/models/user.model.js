import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: true,
			unique: true,
		},
		fullName: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			required: true,
			minLength: 6,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		followers: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
				default: [],
			},
		],
		following: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
				default: [],
			},
		],
		profileImg: {
			type: String,
			default: "",
		},
		coverImg: {
			type: String,
			default: "",
		},
		bio: {
			type: String,
			default: "",
		},

		link: {
			type: String,
			default: "",
		},
		likedPosts: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Post",
				default: [],
			},
		],
	},
	{ timestamps: true }
);

/* // TODO: JUST UNCOMMENT THIS - NOTHING TO DO MUCH
//* 1. Cascade Deletion:
//* Middleware for handling deletion effects
//* 'remove' is a keyword/"method" userstood my mongoose
userSchema.pre('remove', async function (next) {
	const userId = this._id;

	try {
		//* Delete all posts by the user
		await Post.deleteMany({ user: userId });

		//* Remove the user from followers and following lists of other users
		await User.updateMany(
			{ followers: userId },
			{ $pull: { followers: userId } }
		);
		await User.updateMany(
			{ following: userId },
			{ $pull: { following: userId } }
		);

		//* Remove the user from likes in posts
		await Post.updateMany(
			{ likes: userId },
			{ $pull: { likes: userId } }
		);

		//* Remove the user's comments from posts
		await Post.updateMany(
			{ 'comments.user': userId },
			{ $pull: { comments: { user: userId } } }
		);

		next();
	} catch (err) {
		next(err);
	}
});

 */

/* //* JUST READ FOR KNOWLEDGE - how to use in `controllers`	

//* other commmon way to do the above same thing, remaing all are same
//* "findOneAndDelete" or "findOneAndRemove"
userSchema.pre('findOneAndDelete', async function (next) {
	const userId = this.getQuery()._id;
	...
}
or 
userSchema.pre('findOneAndRemove', async function (next) {


//* controller
import express from "express";
import User from "./path/to/UserModel"; // Update the path as necessary

const router = express.Router();

//* Delete user route
router.delete("/users/:id", async (req, res) => {
	try {
		//* if the users gets removed, before that the delete-cascade middleware will run
		const user = await User.findByIdAndRemove(req.params.id);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}
		res.status(200).json({ message: "User deleted successfully" });
	} catch (error) {
		res.status(500).json({ message: "Server error", error });
	}
});

export default router;
 */

const User = mongoose.model("User", userSchema);

export default User;