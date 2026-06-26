"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import SectionSubTitle from "@/common/SectionSubTitle";
import SectionTitle from "@/common/SectionTitle";

// Import local assets
import WithoutCollarMeshImg from "@/public/assets/mesh/without-collar-jersey.png";
import CollarMeshImg from "@/public/assets/mesh/collar-jersey.png";
import BottleMeshImg from "@/public/assets/mesh/bottle.png";
import HoodieMeshImg from "@/public/assets/mesh/hoodie.png";
import JacketMeshImg from "@/public/assets/mesh/jacket.png";
import MugMeshImg from "@/public/assets/mesh/mug.png";
import CoofieBegMeshImg from "@/public/assets/mesh/coffee-bag-mockup.png";
import PaillowMeshImg from "@/public/assets/mesh/paillow.avif";
import BusinessCardImg from "@/public/assets/mesh/business-card.png";
import ShoppingBeg from "@/public/assets/mesh/shopping-beg.png";
import JuiceCupMeshImg from "@/public/assets/mesh/juice-cup.avif";
import CapMeshImg from "@/public/assets/mesh/cap.png";
import SneakerMeshImg from "@/public/assets/mesh/shoes.png"
interface ColorOption {
  colorCode: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  image: any;
  category: string;
  colors: ColorOption[];
  hasMoreColors?: boolean;
}

const CustomProducts = () => {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("All");

  const handleCustomize = (productId: string) => {
    switch (productId) {
      case "jersey-no-collar":
        router.push("/jersey-customize?type=no-collar");
        break;
      case "jersey-collar":
        router.push("/jersey-customize?type=collar");
        break;
      case "mug":
        router.push("/mug-design");
        break;
      case "business-card":
        router.push("/business-card-design");
        break;
      case "paillow":
        router.push("/pillow-design");
        break;
      default:
        toast.info("Customizer for this product is coming soon!");
        break;
    }
  };

  // State to track selected colors for each product (retained in case needed)
  const [selectedColors, setSelectedColors] = useState<Record<string, number>>({
    "jersey-no-collar": 0,
    "jersey-collar": 0,
    "hoodie": 0,
    "jacket": 0,
    "mug": 0,
    "bottle": 0,
    "coffee-bag": 0,
  });

  const categories = ["All", "Homeware", "Paillow", "Business Card","Cap", "Bags","Sneaker", "Cups"];

  const products: Product[] = [
    {
      id: "jersey-no-collar",
      name: "Jersey (No Collar)",
      image: WithoutCollarMeshImg,
      category: "Homeware",
      colors: [
        { colorCode: "#F9A8D4", name: "Pink" },
      ],
    },
    {
      id: "jersey-collar",
      name: "Jersey (Collar)",
      image: CollarMeshImg,
      category: "Homeware",
      colors: [
        { colorCode: "#D1D5DB", name: "Gray" },
        { colorCode: "#B85C5C", name: "Brown" },
        { colorCode: "#FACC15", name: "Yellow" },
      ],
      hasMoreColors: true,
    },
    {
      id: "hoodie",
      name: "Classic Hoodie",
      image: HoodieMeshImg,
      category: "Homeware",
      colors: [
        { colorCode: "#000000", name: "Black" },
        { colorCode: "#808080", name: "Gray" },
      ],
    },
    {
      id: "jacket",
      name: "Windbreaker Jacket",
      image: JacketMeshImg,
      category: "Homeware",
      colors: [
        { colorCode: "#000000", name: "Black" },
        { colorCode: "#808080", name: "Gray" },
      ],
    },
    {
      id: "mug",
      name: "Mug",
      image: MugMeshImg,
      category: "Cups",
      colors: [
        { colorCode: "#000000", name: "Black" },
        { colorCode: "#808080", name: "Gray" },
      ],
    },
    {
      id: "bottle",
      name: "Sports Bottle",
      image: BottleMeshImg,
      category: "Cups",
      colors: [
        { colorCode: "#000000", name: "Black" },
        { colorCode: "#808080", name: "Gray" },
      ],
    },
    {
      id: "coffee-bag",
      name: "Coffee Bag",
      image: CoofieBegMeshImg,
      category: "Bags",
      colors: [
        { colorCode: "#000000", name: "Black" },
        { colorCode: "#808080", name: "Gray" },
      ],
    },
    {
      id: "paillow",
      name: "Paillow",
      image: PaillowMeshImg,
      category: "Paillow",
      colors: [
        { colorCode: "#000000", name: "Black" },
        { colorCode: "#808080", name: "Gray" },
      ],
    },
    {
      id: "business-card",
      name: "Business Card",
      image: BusinessCardImg,
      category: "Business Card",
      colors: [
        { colorCode: "#000000", name: "Black" },
        { colorCode: "#808080", name: "Gray" },
      ],
    },
    {
      id: "shopping-beg",
      name: "Shopping Bag",
      image: ShoppingBeg,
      category: "Bags",
      colors: [
        { colorCode: "#000000", name: "Black" },
        { colorCode: "#808080", name: "Gray" },
      ],
    },
    {
      id: "juice-cup",
      name: "Juice Cup",
      image: JuiceCupMeshImg,
      category: "Cups",
      colors: [
        { colorCode: "#000000", name: "Black" },
        { colorCode: "#808080", name: "Gray" },
      ],
    },
    {
      id: "cap",
      name: "Cap",
      image: CapMeshImg,
      category: "Cap",
      colors: [
        { colorCode: "#000000", name: "Black" },
        { colorCode: "#808080", name: "Gray" },
      ],
    },
    {
      id: "sneaker",
      name: "Sneaker",
      image: SneakerMeshImg,
      category: "Sneaker",
      colors: [
        { colorCode: "#000000", name: "Black" },
        { colorCode: "#808080", name: "Gray" },
      ],
    }
  ];

  const handleColorSelect = (productId: string, colorIndex: number) => {
    setSelectedColors((prev) => ({
      ...prev,
      [productId]: colorIndex,
    }));
  };

  const filteredProducts = activeCategory === "All"
    ? products
    : products.filter((p) => p.category === activeCategory);

  return (
    <section className="relative w-full bg-[#FFFFFF] py-16 md:py-24 overflow-hidden">
      {/* Header Container */}
      <div className="container mx-auto px-6 text-center mb-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <SectionSubTitle title="Divine & Vail Collections" className="mb-2 text-[#565E69]" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <SectionTitle
            title="Premium Custom Merch"
            className="text-[#031E39]"
          />
        </motion.div>
      </div>

      {/* Category Filter Bar */}
      <div className="w-full flex justify-center mb-12 border-b border-gray-100/80">
        <div className="flex items-center gap-6 md:gap-10 pb-4 overflow-x-auto no-scrollbar px-6 max-w-full">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`relative pb-1 text-sm md:text-base font-semibold tracking-wide transition-colors duration-200 cursor-pointer whitespace-nowrap outline-none ${
                activeCategory === category
                  ? "text-[#E94560]"
                  : "text-[#565E69] hover:text-[#1C1C1C]"
              }`}
            >
              {category}
              {activeCategory === category && (
                <motion.div
                  layoutId="activeUnderline"
                  className="absolute bottom-[-17px] left-0 right-0 h-[2.5px] bg-[#E94560]"
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="container mx-auto px-6 md:px-12 lg:px-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {filteredProducts.map((product, index) => {
              return (
                <div
                  key={product.id}
                  className="relative flex flex-col items-center justify-center p-6 bg-white border border-dashed border-[#D2D2D2] rounded-[32px] hover:shadow-lg transition-all duration-300 group"
                >
                  {/* Image Container with light beige/cream background */}
                  <div className="relative w-full aspect-square bg-[#F4ECE6] rounded-[24px] overflow-hidden flex items-center justify-center p-6 md:p-8">
                    {/* Subtle hover zoom/float for product image */}
                    <motion.div
                      whileHover={{ y: -8, scale: 1.02 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="relative w-full h-full flex items-center justify-center"
                    >
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        priority={index < 3}
                        quality={95}
                        className="object-contain p-2"
                      />
                    </motion.div>
                  </div>

                  {/* Info & Call-To-Action */}
                  <div className="flex flex-col items-center mt-6 w-full text-center">
                    <h3 className="text-lg md:text-xl font-bold text-[#1C1C1C] mt-1.5">
                      {product.name}
                    </h3>

                    {/* Customize Button */}
                    <motion.button
                      onClick={() => handleCustomize(product.id)}
                      whileTap={{ scale: 0.95 }}
                      className="mt-5 px-8 py-3 bg-[#E94560] hover:bg-[#D83651] active:bg-[#C22D46] text-white cursor-pointer text-sm font-bold uppercase tracking-wider rounded-[20px] transition-all shadow-sm duration-200"
                    >
                      Customize
                    </motion.button>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
        
        {/* Empty state when no products in selected category */}
        {filteredProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full text-center py-12 text-[#565E69] text-base"
          >
            No products found in this category.
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default CustomProducts;
