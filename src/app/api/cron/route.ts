import { NextResponse } from "next/server";

import Product from "@/lib/models/product.model";
import { connectToDB } from "@/lib/mongoose";
import { scrapeAmazonProduct } from "@/lib/scrapper";
import {
	getAveragePrice,
	getHighestPrice,
	getLowestPrice,
} from "@/utils/utils";

export const maxDuration = 300; // This function can run for a maximum of 300 seconds
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
	try {
		connectToDB();

		const products = await Product.find({});

		if (!products) throw new Error("No product fetched");

		// ======================== 1 SCRAPE LATEST PRODUCT DETAILS & UPDATE DB
		const updatedProducts = await Promise.all(
			products.map(async (currentProduct) => {
				// Scrape product
				const scrapedProduct = await scrapeAmazonProduct(
					currentProduct.url
				);

				if (!scrapedProduct) return;

				const updatedPriceHistory = [
					...currentProduct.priceHistory,
					{
						price: scrapedProduct.currentPrice,
					},
				];

				const product = {
					...scrapedProduct,
					priceHistory: updatedPriceHistory,
					lowestPrice: getLowestPrice(updatedPriceHistory),
					highestPrice: getHighestPrice(updatedPriceHistory),
					averagePrice: getAveragePrice(updatedPriceHistory),
				};

				// Update Products in DB
				const updatedProduct = await Product.findOneAndUpdate(
					{
						url: product.url,
					},
					product
				);

				return updatedProduct;
			})
		);

		return NextResponse.json({
			message: "Ok",
			data: updatedProducts,
		});
	} catch (error: any) {
		throw new Error(`Failed to get all products: ${error.message}`);
	}
}
