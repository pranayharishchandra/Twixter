//* `$pull` operator is a Mongoose (and MongoDB) operation that removes all instances of a value from an array. 
import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		text: {
			type: String,
		},
		img: {
			type: String,
		},
		likes: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
		],
		comments: [
			{
				text: {
					type: String,
					required: true,
				},
				user: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "User",
					required: true,
				},
			},
		],
	},
	{ timestamps: true }
);

/* // TODO: (JUST UNCOMMENT) when "post" deleted then that should be removed from the user's liked post 
//* Middleware for handling post deletion effects
//* postSchema.pre('remove', async function (next) {
//* 	const postId = this._id;

//* Middleware for handling post deletion effects
postSchema.pre('remove', async function (next) {
	const postId = this._id;

	try {
		//* Remove post from likedPosts array of all users who liked it
		! don't forget to import User model
		await User.updateMany(
			{ likedPosts: postId }, //* likedPosts is an "array" of likedPosts  
			{ $pull: { likedPosts: postId } }
		);

		//* Remove all comments associated with this post
		await Post.updateMany(
			{ _id: postId },
			{ $set: { comments: [] } }
		);

		next();
	} catch (err) {
		next(err);
	}
});
 */

const Post = mongoose.model("Post", postSchema);

export default Post;

/*  //* Handling Deletion Effects
* after user gets deleted, it's id will still remain in the post however the user donesn't exists
* Handling Deletion Effects:-
* 1. Cascade Deletion:
Automatic Deletion: When a user is deleted, all associated posts and comments can be automatically deleted.
Implementation: This requires setting up middleware in Mongoose.
Example:
----------------------------------------------------------------------
//* User Schema with pre-remove hook
userSchema.pre('remove', async function (next) {
	const userId = this._id;
	await Post.deleteMany({ user: userId }); // Delete user's posts
	await Post.updateMany(
		{ 'comments.user': userId },
		{ $pull: { comments: { user: userId } } }
	); // Remove user's comments
	next();
});
----------------------------------------------------------------------

* 2. Retain Comments with Null User
Set to Null: When a user is deleted, update the user field in comments to null.
Identification: The comment will still exist but with a null user field.
Example:


----------------------------------------------------------------------
//* User Schema with pre-remove hook
userSchema.pre('remove', async function (next) {
	const userId = this._id;
	await Post.updateMany(
		{ 'comments.user': userId },
		{ $set: { 'comments.$.user': null } }
	);
	next();
});
----------------------------------------------------------------------

* 3. Orphaned Comments
Orphan Comments: Leave the comments as they are, leading to potential orphaned references.
Identification: These comments will reference a non-existent user.
Example:

This requires no changes, but is generally not recommended as it can lead to inconsistencies.
Recommendation
Cascade Deletion is often the best approach for maintaining data integrity and avoiding orphaned comments.






 */