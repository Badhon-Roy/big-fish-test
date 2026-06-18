"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface Design {
  id: string;
  name: string;
  fileName: string;
  category: string;
}

const DesignGallery = ({ isHomePage = false }: { isHomePage?: boolean }) => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(isHomePage ? 16 : 12);
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);

  const categories = [
    "All",
    "Anniversary",
    "Appreciation",
    "Celebration",
    "Father's Day",
    "Other Patterns",
  ];

  // List of all 59 design files in public/assets/ecard-cover/
  const designs: Design[] = [
    {
      id: "1",
      name: "Work Anniversary (3D Office Desk)",
      fileName: "3d-character-computer-desk-plant-office-free-work-anniversary-ecard.webp",
      category: "Anniversary",
    },
    {
      id: "2",
      name: "Anniversary Clinking Glasses",
      fileName: "3d-silver-wine-glasses-clinking-happy-anniversary-to-the-nicest-worker-free-ecard.webp",
      category: "Anniversary",
    },
    {
      id: "3",
      name: "Best Dad Ever Father's Day",
      fileName: "best-dad-ever-fathers-day-group-greeting-ecards.png",
      category: "Father's Day",
    },
    {
      id: "4",
      name: "Best Employee Award Pattern",
      fileName: "best-employee-award-free-group-greeting-ecards-swo.png",
      category: "Appreciation",
    },
    {
      id: "5",
      name: "Best Employee Trophy Pattern",
      fileName: "best-employee-trophy-free-award-group-greeting-ecards-swo.png",
      category: "Appreciation",
    },
    {
      id: "6",
      name: "Best Golf Coach Graphic",
      fileName: "best-golf-coach-free-award-group-greeting-ecards-swo.png",
      category: "Appreciation",
    },
    {
      id: "7",
      name: "Best of Luck Template",
      fileName: "best-of-luck-from-all-of-us-free-congratulations-group-greeting-ecards.png",
      category: "Celebration",
    },
    {
      id: "8",
      name: "Juneteenth Freedom Day Graphic",
      fileName: "broken-chain-raised-fists-free-juneteenth-ecard.webp",
      category: "Other Patterns",
    },
    {
      id: "9",
      name: "Cheers to Success Graphic",
      fileName: "cheers-to-you-success-cheers-free-office-congrats-group-cards.png",
      category: "Celebration",
    },
    {
      id: "10",
      name: "Professional Milestone Print",
      fileName: "cheers-to-your-professional-milestone-from-the-entire-team-blue-background-free-milestone-ecard.png",
      category: "Anniversary",
    },
    {
      id: "11",
      name: "Well Deserved Promotion (Thumbs Up)",
      fileName: "cheers-to-your-well-deserved-promotion-from-all-of-us-thumbs-up-beige-background-free-promotion-ecard.png",
      category: "Celebration",
    },
    {
      id: "12",
      name: "Team Wishes (Boba Tea)",
      fileName: "colorful-boba-tea-characters-cheering-team-wishes-free-new-job-ecard.webp",
      category: "Celebration",
    },
    {
      id: "13",
      name: "Congrats Autumn Snail & Leaves",
      fileName: "congrats-snail-leaves-autumn-free-job-promotion-group-greeting-ecards-swo.png",
      category: "Celebration",
    },
    {
      id: "14",
      name: "You Totally Nailed It graphic",
      fileName: "congrats-you-totally-nailed-it-free-office-congrats-group-greeting-ecards.png",
      category: "Celebration",
    },
    {
      id: "15",
      name: "Work Anniversary (Cozy Desk Layout)",
      fileName: "cozy-desk-dedication-free-work-anniversary-card.webp",
      category: "Anniversary",
    },
    {
      id: "16",
      name: "Dad, You Are The King (Lion Face)",
      fileName: "cute-lion-face-crown-orange-mane-dad-you-are-the-king-message-free-fathers-day-ecard.webp",
      category: "Father's Day",
    },
    {
      id: "17",
      name: "Teal Script Promotion Owls",
      fileName: "cute-owls-teal-script-congrats-promotion-from-all-of-us-free-job-promotion-ecard.webp",
      category: "Celebration",
    },
    {
      id: "18",
      name: "You Snailed It! Promotion graphic",
      fileName: "cute-snail-gold-shell-autumn-leaves-congrats-you-snailed-it-free-job-promotion-ecard.webp",
      category: "Celebration",
    },
    {
      id: "19",
      name: "Dad, The King of Hearts",
      fileName: "dad-you-are-the-king-free-fathers-day-group-greeting-ecards.png",
      category: "Father's Day",
    },
    {
      id: "20",
      name: "Finally, You Did It! Template",
      fileName: "finally-you-did-it-promotion-free-group-greeting-ecards.png",
      category: "Celebration",
    },
    {
      id: "21",
      name: "New Job Congrats Potato Graphic",
      fileName: "funny-potato-character-glasses-briefcase-free-new-job-ecard.webp",
      category: "Celebration",
    },
    {
      id: "22",
      name: "Go Green Eco Print",
      fileName: "go-green-free-world-environment-group-greeting-ecards-swo.png",
      category: "Other Patterns",
    },
    {
      id: "23",
      name: "High Five Sticker Print",
      fileName: "gold-hand-sticker-hi-five-you-deserve-high-five-free-job-promotion-ecard.webp",
      category: "Appreciation",
    },
    {
      id: "24",
      name: "Gold Lettering Anniversary Layout",
      fileName: "gold-lettering-first-from-all-of-us-online-work-anniversary-group-card-swo.jpg",
      category: "Anniversary",
    },
    {
      id: "25",
      name: "Gold Trophy Medal Print",
      fileName: "gold-trophy-medal-stars-banner-free-appreciation-ecard.png",
      category: "Appreciation",
    },
    {
      id: "26",
      name: "Love Dad Red Heart Template",
      fileName: "handwritten-love-dad-text-red-heart-simple-background-free-fathers-day-ecard.webp",
      category: "Father's Day",
    },
    {
      id: "27",
      name: "Happy Boss Day Trophy & Crown",
      fileName: "happy-boss-day-thumbs-up-with-appreciation-tie-and-crown-trophy-happy-boss-day-group-greeting-cards-swo-new.png",
      category: "Father's Day",
    },
    {
      id: "28",
      name: "Happy Boss Day Gradient Mustache",
      fileName: "happy-bosss-day-with-tie-crown-blue-gradient-and-moustache-happy-boss-day-office-card-group-greeting-cards-swo-new.png",
      category: "Father's Day",
    },
    {
      id: "29",
      name: "Happy 20th Anniversary Pattern",
      fileName: "happy-twenty-year-work-anniversary-free-group-greeting-ecards-swo-yellow.png",
      category: "Anniversary",
    },
    {
      id: "30",
      name: "Happy Father's Day Multi-Graphic",
      fileName: "hsppy-father-day-group-greeting-ecards.png",
      category: "Father's Day",
    },
    {
      id: "31",
      name: "I Love Dad Hands Holding Graphic",
      fileName: "i-love-dad-hands-holding-sparkling-background-free-fathers-day-ecard.gif",
      category: "Father's Day",
    },
    {
      id: "32",
      name: "Great to Meet You Graphic",
      fileName: "it-was-great-to-meet-you-minimal-script-team-card.png",
      category: "Other Patterns",
    },
    {
      id: "33",
      name: "Job Joy Ahead Compass Print",
      fileName: "job-joy-ahead-compass-for-future-direction-free-congrats-group-card-swo.png",
      category: "Celebration",
    },
    {
      id: "34",
      name: "Office Workspace Appreciation Print",
      fileName: "laptop-desk-donuts-coffee-calculator-phone-office-appreciation-message-free-appreciation-ecard.webp",
      category: "Appreciation",
    },
    {
      id: "35",
      name: "Leadership Shield Pattern",
      fileName: "leadership-free-award-group-greeting-ecards-swo.png",
      category: "Appreciation",
    },
    {
      id: "36",
      name: "Little Shining Star Layout",
      fileName: "little-shining-star.webp",
      category: "Appreciation",
    },
    {
      id: "37",
      name: "Lovely Meeting You Graphic",
      fileName: "lovely-meeting-you-cheers-free-nice-meeting-you-group-greeting-ecards-swo.png",
      category: "Other Patterns",
    },
    {
      id: "38",
      name: "Most Supportive Employee Shield",
      fileName: "most-supportive-employee-free-award-group-greeting-ecards-swo.png",
      category: "Appreciation",
    },
    {
      id: "39",
      name: "Anniversary Muffin & Mustache layout",
      fileName: "muffin-character-mustache-coffee-hearts-free-work-anniversary-ecard.webp",
      category: "Anniversary",
    },
    {
      id: "40",
      name: "Forgiveness Ribbon Heart layout",
      fileName: "pink-heart-wrapped-ribbon-lavender-free-forgiveness-day-ecard.webp",
      category: "Other Patterns",
    },
    {
      id: "41",
      name: "Pinky Promise Heart Hands Graphic",
      fileName: "pinky-promise-heart-hands-pink-free-forgiveness-day-ecard.webp",
      category: "Other Patterns",
    },
    {
      id: "42",
      name: "Best Boss Leaf Frame Pattern",
      fileName: "purple-text-best-boss-message-leaf-decor-light-background-free-boss-day-ecard.webp",
      category: "Father's Day",
    },
    {
      id: "43",
      name: "Rainbow Forest Environment day",
      fileName: "rainbow-forest-globe-free-world-environment-day-card.webp",
      category: "Other Patterns",
    },
    {
      id: "44",
      name: "Best Boss Ribbon Banner Print",
      fileName: "red-ribbon-banner-best-message-paper-background-free-boss-day-ecard.webp",
      category: "Father's Day",
    },
    {
      id: "45",
      name: "Boss Day Spectacles Graphic",
      fileName: "red-tie-spectacles-happy-boss-day-yellow-background-free-ecards.webp",
      category: "Father's Day",
    },
    {
      id: "46",
      name: "Solar Wind Cupped Earth Graphic",
      fileName: "solar-wind-cupped-earth-free-world-environment-day-card.webp",
      category: "Other Patterns",
    },
    {
      id: "47",
      name: "Stick Figure Cake Anniversary",
      fileName: "stick-figure-holding-cake-free-employee-anniversary-group-card-swo.jpg",
      category: "Anniversary",
    },
    {
      id: "48",
      name: "Happy Birthday Wax Candles",
      fileName: "tall-wax-candles-colorful-confetti-pink-background-free-birthday-ecard.webp",
      category: "Other Patterns",
    },
    {
      id: "49",
      name: "Birthday Tea Cup & Donut layout",
      fileName: "tea-cup-donut-funny-pun-bestie-free-birthday-ecard.webp",
      category: "Other Patterns",
    },
    {
      id: "50",
      name: "Thank You Nice Meeting You layout",
      fileName: "thank-you-for-meeting-me-free-nice-meeting-you-group-greeting-ecards-swo.png",
      category: "Other Patterns",
    },
    {
      id: "51",
      name: "Trophy Orange Frame graphic",
      fileName: "trophy-one-ribbon-badge-orange-frame-free-appreciation-ecard.webp",
      category: "Appreciation",
    },
    {
      id: "52",
      name: "Cookie Characters Congrats Graphic",
      fileName: "two-cookie-characters-waving-pat-on-back-message-free-congratulations-ecard.webp",
      category: "Celebration",
    },
    {
      id: "53",
      name: "Birthday Vintage Red Car graphic",
      fileName: "vintage-red-car-stacked-gifts-holly-free-birthday-ecard.webp",
      category: "Other Patterns",
    },
    {
      id: "54",
      name: "Employee Appreciation Watermelon Graphic",
      fileName: "watermelon-character-sunglasses-inner-tube-yellow-background-free-employee-appreciation-ecard.webp",
      category: "Appreciation",
    },
    {
      id: "55",
      name: "Enjoyed Meeting You template",
      fileName: "we-have-enjoyed-meeting-you-from-all-of-us-free-group-card.png",
      category: "Other Patterns",
    },
    {
      id: "56",
      name: "Welcome to Our Beautiful Chaos print",
      fileName: "welcome-to-our-beautiful-chaos-free-group-greeting-ecards.png",
      category: "Other Patterns",
    },
    {
      id: "57",
      name: "Environment day Wildlife Graphic",
      fileName: "wildlife-globe-florals-free-world-environment-day-card.png",
      category: "Other Patterns",
    },
    {
      id: "58",
      name: "Anniversary Red Background Pattern",
      fileName: "work-is-better-with-you-red-bg-free-anniversary-group-card-swo.png",
      category: "Anniversary",
    },
    {
      id: "59",
      name: "World's Best Boss Coffee Mug Graphic",
      fileName: "worlds-best-boss-with-cup-of-coffee-happy-boss-day-group-greeting-cards-swo-new.png",
      category: "Father's Day",
    },
  ];

  // Filtering and search logic combined
  const filteredDesigns = useMemo(() => {
    return designs.filter((design) => {
      const matchesCategory =
        activeCategory === "All" || design.category === activeCategory;
      const matchesSearch =
        design.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        design.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  // Paginated list
  const paginatedDesigns = useMemo(() => {
    if (isHomePage) {
      return designs.slice(0, 12);
    }
    return filteredDesigns.slice(0, visibleCount);
  }, [filteredDesigns, visibleCount, isHomePage, designs]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 12);
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setVisibleCount(12); // Reset count on tab change
  };

  return (
    <section className="relative w-full bg-[#F5F7FA] py-16 md:py-24 overflow-hidden">
      {/* Header Container */}
      <div className="container mx-auto px-6 text-center mb-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-[#565E69] text-center text-[16px] md:text-[18px] lg:text-[24px] mb-2 font-medium">
            Customization Prints & Templates
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-black text-center text-[32px] sm:text-[40px] md:text-[48px] lg:text-[55px] font-semibold text-[#031E39]">
            Choose a Design for Your 3D Models
          </h1>
        </motion.div>
      </div>

      {/* Filter & Search Bar Container */}
      {!isHomePage && (
        <div className="container mx-auto px-6 md:px-12 max-w-6xl mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Category Filter Tabs */}
          <div className="flex items-center gap-4 pb-2 overflow-x-auto no-scrollbar max-w-full w-full md:w-auto border-b border-gray-200 md:border-none">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`relative pb-2 text-sm font-semibold tracking-wide transition-colors duration-200 cursor-pointer whitespace-nowrap outline-none ${
                  activeCategory === category
                    ? "text-[#E94560]"
                    : "text-[#565E69] hover:text-[#1C1C1C]"
                }`}
              >
                {category}
                {activeCategory === category && (
                  <motion.div
                    layoutId="activeCategoryUnderline"
                    className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#E94560]"
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search designs..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(12); // Reset count on search
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-300 text-sm text-[#1C1C1C] placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#E94560] focus:border-transparent transition-all duration-200 shadow-sm"
            />
            {/* Search Icon */}
            <svg
              className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      )}

      {/* Cards Grid */}
      <div className="container mx-auto px-6 md:px-12 lg:px-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory + searchQuery}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
          >
            {paginatedDesigns.map((design) => (
              <div
                key={design.id}
                onClick={() => setSelectedDesign(design)}
                className="relative flex flex-col justify-between overflow-hidden bg-white border border-gray-200 rounded hover:shadow-lg transition-all duration-300 group cursor-pointer"
              >
                {/* Image Wrap */}
                <div className="relative w-full h-[250px] overflow-hidden">
                  <Image
                    src={`/assets/ecard-cover/${design.fileName}`}
                    alt={design.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105 rounded-tl"
                    loading="lazy"
                  />
                  {/* Subtle Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="px-5 py-2 bg-white text-black text-xs font-bold rounded-full tracking-wider uppercase transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 shadow-sm">
                      Apply to 3D Model
                    </span>
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-5 flex flex-col justify-between flex-grow">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#E94560]">
                      {design.category}
                    </span>
                    <h3 className="text-sm md:text-base font-bold text-[#031E39] mt-1 line-clamp-2">
                      {design.name}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Empty State */}
        {filteredDesigns.length === 0 && (
          <div className="w-full text-center py-16 text-gray-500 text-base">
            No design patterns found matching your search.
          </div>
        )}

        {/* Load More Button or See More Designs Button */}
        {!isHomePage && filteredDesigns.length > visibleCount && (
          <div className="flex justify-center mt-12">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleLoadMore}
              className="px-8 py-3.5 bg-[#031E39] hover:bg-[#09355E] active:scale-95 text-white text-sm font-bold uppercase tracking-wider rounded-full transition-all shadow-md cursor-pointer"
            >
              Load More
            </motion.button>
          </div>
        )}

        {isHomePage && (
          <div className="flex justify-center mt-12">
            <Link
              href="/designs"
              className="px-8 py-3.5 bg-[#031E39] hover:bg-[#09355E] active:scale-95 text-white text-sm font-bold uppercase tracking-wider rounded-full transition-all shadow-md cursor-pointer inline-block"
            >
              See More Designs
            </Link>
          </div>
        )}
      </div>

      {/* Modal Preview Container */}
      <AnimatePresence>
        {selectedDesign && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
            onClick={() => setSelectedDesign(null)}
          >
            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-4xl w-full bg-white rounded-[24px] overflow-hidden shadow-2xl flex flex-col md:flex-row pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedDesign(null)}
                className="absolute top-4 right-4 z-10 p-2 text-white bg-black/50 hover:bg-black/80 rounded-full transition-colors cursor-pointer"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Modal Image Section */}
              <div className="relative w-full md:w-3/5 aspect-[4/3] bg-gray-50 md:aspect-auto">
                <Image
                  src={`/assets/ecard-cover/${selectedDesign.fileName}`}
                  alt={selectedDesign.name}
                  fill
                  className="object-contain p-4 md:p-8"
                  quality={100}
                />
              </div>

              {/* Modal Details Section */}
              <div className="w-full md:w-2/5 p-6 md:p-8 flex flex-col justify-between bg-white border-t md:border-t-0 md:border-l border-gray-100">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#E94560]">
                    {selectedDesign.category}
                  </span>
                  <h2 className="text-xl md:text-2xl font-bold text-[#031E39] mt-2 mb-4">
                    {selectedDesign.name}
                  </h2>
                  <p className="text-sm text-[#565E69] leading-relaxed mb-6">
                    Apply this design pattern onto our interactive 3D customization models. Choose a product type below to get started.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Select a 3D Model:
                  </div>
                  
                  <Link
                    href={`/brand-new-design?pattern=${selectedDesign.fileName}`}
                    className="w-full py-3 bg-[#031E39] hover:bg-[#09355E] text-white text-center text-sm font-bold uppercase tracking-wider rounded-full shadow-sm transition-all duration-200 block"
                  >
                    👕 Jersey (No Collar)
                  </Link>

                  <Link
                    href={`/collar-jersey-design?pattern=${selectedDesign.fileName}`}
                    className="w-full py-3 bg-[#031E39] hover:bg-[#09355E] text-white text-center text-sm font-bold uppercase tracking-wider rounded-full shadow-sm transition-all duration-200 block"
                  >
                    👔 Jersey (Collar)
                  </Link>

                  <Link
                    href={`/mug-design?pattern=${selectedDesign.fileName}`}
                    className="w-full py-3 bg-[#031E39] hover:bg-[#09355E] text-white text-center text-sm font-bold uppercase tracking-wider rounded-full shadow-sm transition-all duration-200 block"
                  >
                    ☕ Custom Mug
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default DesignGallery;
