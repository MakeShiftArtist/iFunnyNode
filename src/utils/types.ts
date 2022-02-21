export interface Size {
	w: number;
	h: number;
}

export interface Badge {
	url: string;
	size: Size;
}

export interface MemeExperience {
	days: number;
	next_milestone: number | null;
	rank: string;
	badge: Badge;
}

export interface UserStats {
	subscribers: number;
	subscriptions: number;
	total_posts: number;
	created: number;
	featured: number;
	total_smiles: number;
	achievements: number;
}
export interface Level {
	id: string;
	value: number;
	points: number;
}

export interface Rating {
	points: number;
	current_level: Level;
	next_level: Level;
	max_level: Level;
	is_show_level: boolean;
}

interface PFPThumbnail {
	small_url: string;
	medium_url: string;
	large_url: string;
}

export interface ProfilePicture {
	bg_color: number;
	thumb: PFPThumbnail;
	url: string;
}

export interface CoverImage {
	url: string;
	bg_color: string;
}

export interface Thumbnail {
	small_url: string;
	url: string;
	large_url: string;
	x640_url: string;
	webp_url: string;
	large_webp_url: string;
	proportional_url: string;
	proportional_webp_url: string;
	proportional_size: Size;
}

export interface PostNums {
	smiles: number;
	unsmiles: number;
	guest_smiles: number;
	comments: number;
	views: number;
	republished: number;
	shares: number;
}

export interface PostData {
	bytes?: number;
	duration?: number;
	screen_url?: string;
	source_type?: string;
	mp4_url?: string;
	mp4_bytes?: number;
	webm_bytes?: number;
	webm_url?: string;
	webp_url?: string;
	logo_url?: string;
}

export type SeenFrom = "prof" | "feat" | "coll" | "my-smiles" | "reads";
