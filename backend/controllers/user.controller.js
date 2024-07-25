import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

  // models
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

export const getUserProfile = async (req, res) => {
	const { username } = req.params;

	try {
		const user = await User.findOne({ username }).select("-password");
		if (!user) return res.status(404).json({ message: "User not found" });

		res.status(200).json(user);
	} catch (error) {
		console.log("Error in getUserProfile: ", error.message);
		res.status(500).json({ error: error.message });
	}
};

export const followUnfollowUser = async (req, res) => {
	try {
		const { id }       = req.params;													// if of user maine jisko follow kiya
		const userToModify = await User.findById(id);             // maine jisko follow kiya
		const currentUser  = await User.findById(req.user._id);   // mera khud ka bhi to change hoga followers
		
		if (!userToModify || !currentUser) return res.status(400).json({ error: "User not found" });

		//* not an error but a bad request
		if (id === req.user._id.toString()) {
			return res.status(400).json({ error: "You can't follow/unfollow yourself" });
		}

		const isFollowing = currentUser.following.includes(id);

		if (isFollowing) {
			//* Unfollow the user
			await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
			await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });

			res.status(200).json({ message: "User unfollowed successfully" });
		} else {
			//* Follow the user
			await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
			await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });

			//* Send notification to the user
			const newNotification = new Notification({
				type: "follow",
				from: req.user._id,
				to  : userToModify._id,
			});

			await newNotification.save();

			res.status(200).json({ message: "User followed successfully" });
		}
	} catch (error) {
		console.log("Error in followUnfollowUser: ", error.message);
		res.status(500).json({ error: error.message });
	}
};


export const getSuggestedUsers = async (req, res) => {
	//* suggested users = allUsers - myFollowingUsers - me
	try {
		const userId = req.user._id;

		const usersFollowedByMe = await User.findById(userId).select("following");

		// random 10 users other than me in an array
		const users = await User.aggregate([
			{ $match : {  _id: { $ne: userId } } },
			{ $sample: { size: 10 } },
		]);

		const filteredUsers  = users.filter((user) => !usersFollowedByMe.following.includes(user._id));
		const suggestedUsers = filteredUsers.slice(0, 4);

		suggestedUsers.forEach((user) => (user.password = null));

		res.status(200).json(suggestedUsers);
	} catch (error) {
		console.log("Error in getSuggestedUsers: ", error.message);
		res.status(500).json({ error: error.message });
	}
};

export const updateUser = async (req, res) => {
	const { fullName, email, username, currentPassword, newPassword, bio, link } = req.body;
	let { profileImg, coverImg }                                                 = req.body;

	const userId = req.user._id;

	try {
		let user = await User.findById(userId);
		if (!user) return res.status(404).json({ message: "User not found" });

		if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
			return res.status(400).json({ error: "Please provide both current password and new password" });
		}

		if (currentPassword && newPassword) {
			//* will hash the currentPassword and will match it with the user.password
			const isMatch = await bcrypt.compare(currentPassword, user.password);

			if (!isMatch) return res.status(400).json({ error: "Current password is incorrect" });
			
			if (newPassword.length < 6) {
				return res.status(400).json({ error: "Password must be at least 6 characters long" });
			}

			const salt          = await bcrypt.genSalt(10);
			      user.password = await bcrypt.hash(newPassword, salt);
		}

		if (profileImg) {
			if (user.profileImg) {
				// https://res.cloudinary.com/dyfqon1v6/image/upload/v1712997552/zmxorcxexpdbh8r0bkjb.png
				await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
			}

			const uploadedResponse = await cloudinary.uploader.upload(profileImg);
			      profileImg       = uploadedResponse.secure_url;
		}

		if (coverImg) {
			if (user.coverImg) {
				await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
			}

			const uploadedResponse = await cloudinary.uploader.upload(coverImg);
			      coverImg         = uploadedResponse.secure_url;
		}

/*
		user = Object.assign(user, {
			fullName  : fullName || user.fullName,
			email     : email || user.email,
			username  : username || user.username,
			bio       : bio || user.bio,
			link      : link || user.link,
			profileImg: profileImg || user.profileImg,
			coverImg  : coverImg || user.coverImg
		});

		user = await user.save();
 */

		user.fullName   = fullName || user.fullName;
		user.email      = email || user.email;
		user.username   = username || user.username;
		user.bio        = bio || user.bio;
		user.link       = link || user.link;
		user.profileImg = profileImg || user.profileImg;
		user.coverImg   = coverImg || user.coverImg;

		user = await user.save();

		// password should be null in response
		user.password = null;

		return res.status(200).json(user);
	} 
	catch (error) {
		console.log("Error in updateUser: ", error.message);
		res.status(500).json({ error: error.message });
	}
};
