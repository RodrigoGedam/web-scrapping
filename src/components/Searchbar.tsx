"use client";

import { scrapeAndStoreProduct } from "@/lib/actions";
import { FormEvent, useState } from "react";

const isValidAmazonProductURL = (url: string) => {
	try {
		const parsedURL = new URL(url);
		const hostname = parsedURL.hostname;

		//Checar se hostname contém amazon.com ou amazon.
		if (
			hostname.includes("amazon.com") ||
			hostname.includes("amazon.com.br") ||
			hostname.includes("amazon.") ||
			hostname.endsWith("amazon")
		) {
			return true;
		}
	} catch (error) {
		return false;
	}
	return false;
};

export default function Searchbar() {
	const [searchPromt, setSearchPromt] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const isValidLink = isValidAmazonProductURL(searchPromt);

		if (!isValidLink) return alert("Please provide a valid amazon link!");

		try {
			setIsLoading(true);

			//Scrape the product page
			const product = await scrapeAndStoreProduct(searchPromt);
		} catch (error) {
			console.log(error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<form className="flex flex-wrap gap-4 mt-12" onSubmit={handleSubmit}>
			<input
				type="text"
				value={searchPromt}
				onChange={(e) => setSearchPromt(e.target.value)}
				placeholder="Enter product link"
				className="searchbar-input"
			/>
			<button
				type="submit"
				className="searchbar-btn"
				disabled={searchPromt === ""}
			>
				{isLoading ? "Searching..." : "Search"}
			</button>
		</form>
	);
}
