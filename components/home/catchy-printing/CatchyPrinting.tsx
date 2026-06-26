"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

// Import local assets
import jerseyImg from "@/assets/images/catchy-printing-jersey.png";
import jacketImg from "@/assets/images/catchy-printing-jacket.png";
import drinkwareImg from "@/assets/images/catchy-printing-drinkware.png";
import printsImg from "@/assets/images/catchy-printing-prints.png";

const CatchyPrinting = () => {
  return (
    <section className="relative w-full bg-[#FFFFFF] py-16 md:py-24 overflow-hidden">
      {/* Header Container */}
      <div className="container mx-auto px-6 text-center mb-12 md:mb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-[#565E69] text-center text-[16px] md:text-[18px] lg:text-[24px] mb-2 font-medium">
            Creative Print Showcase
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-black text-center text-[32px] sm:text-[40px] md:text-[48px] lg:text-[55px] font-semibold text-[#031E39] tracking-tight">
            Highly Catchy Printing
          </h1>
        </motion.div>
      </div>

      {/* Grid Container */}
      <div className="container mx-auto px-6 md:px-12 lg:px-20 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column - Large Vertical Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full aspect-[4/5] lg:aspect-auto lg:h-full rounded-[32px] overflow-hidden bg-gray-50 border border-gray-100 group shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <Image
              src={jerseyImg}
              alt="Designer Jerseys Customizer"
              fill
              priority
              quality={95}
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
            {/* Dark gradient overlay at bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            
            {/* Center Pill Button */}
            <Link
              href="/jersey-customize"
              className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white text-[#031E39] font-bold text-xs md:text-sm tracking-wider uppercase px-8 py-3.5 rounded-full shadow-lg hover:bg-[#E94560] hover:text-white transition-all active:scale-95 duration-200"
            >
              Designer Jerseys
            </Link>
          </motion.div>

          {/* Right Column - Top Wide Card, Bottom Grid */}
          <div className="flex flex-col gap-6 lg:gap-8">
            
            {/* Top Wide Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full aspect-[2/1.1] rounded-[32px] overflow-hidden bg-gray-50 border border-gray-100 group shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <Image
                src={jacketImg}
                alt="Casual Classics Jackets"
                fill
                quality={95}
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              
              <Link
                href="/jersey-customize?type=collar"
                className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white text-[#031E39] font-bold text-xs md:text-sm tracking-wider uppercase px-8 py-3.5 rounded-full shadow-lg hover:bg-[#E94560] hover:text-white transition-all active:scale-95 duration-200"
              >
                Casual Classics
              </Link>
            </motion.div>

            {/* Bottom Row Grid (2 Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
              
              {/* Bottom Left Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full aspect-[1/1.1] rounded-[32px] overflow-hidden bg-gray-50 border border-gray-100 group shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <Image
                  src={drinkwareImg}
                  alt="Custom Drinkware & Glam Accessories"
                  fill
                  quality={95}
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <Link
                  href="/mug-design"
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white text-[#031E39] font-bold text-xs md:text-sm tracking-wider uppercase px-6 py-3.5 rounded-full shadow-lg hover:bg-[#E94560] hover:text-white transition-all active:scale-95 duration-200 whitespace-nowrap"
                >
                  Glam Accessories
                </Link>
              </motion.div>

              {/* Bottom Right Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full aspect-[1/1.1] rounded-[32px] overflow-hidden bg-gray-50 border border-gray-100 group shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <Image
                  src={printsImg}
                  alt="Cloth Garments Fabric Prints"
                  fill
                  quality={95}
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <Link
                  href="/designs"
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white text-[#031E39] font-bold text-xs md:text-sm tracking-wider uppercase px-6 py-3.5 rounded-full shadow-lg hover:bg-[#E94560] hover:text-white transition-all active:scale-95 duration-200 whitespace-nowrap"
                >
                  Cloth Garments
                </Link>
              </motion.div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default CatchyPrinting;
