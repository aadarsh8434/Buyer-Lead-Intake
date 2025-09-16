"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/shadcn/button";
import { Card, CardContent } from "@/components/ui/shadcn/card";
import { Badge } from "@/components/ui/badge";
import {
  Github,
  Sparkles,
  Users,
  Search,
  Download,
  ArrowRight,
  Database,
  Filter,
  FileSpreadsheet,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  Variants,
} from "framer-motion";

interface MousePosition {
  x: number;
  y: number;
}

interface Lead {
  name: string;
  company: string;
  status: "Hot" | "Warm" | "Cold";
}

interface Feature {
  icon: any;
  title: string;
  description: string;
  color: string;
}

interface Stat {
  value: number;
  label: string;
  color: string;
}

export default function LeadHubLanding() {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [mousePosition, setMousePosition] = useState<MousePosition>({
    x: 0,
    y: 0,
  });

  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll();
  const { scrollY } = useScroll();

  // Parallax transforms
  const heroY = useTransform(scrollY, [0, 500], [0, -100]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  const featuresInView = useInView(featuresRef, { once: true });
  const previewInView = useInView(previewRef, { once: true });

  useEffect(() => {
    setIsVisible(true);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const router = useRouter();

  // Animation variants with proper TypeScript typing
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const cardVariants: Variants = {
    hidden: { y: 50, opacity: 0, scale: 0.9 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
    hover: {
      y: -10,
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
  };

  const floatingVariants: Variants = {
    initial: { y: 0 },
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const leads: Lead[] = [
    {
      name: "Sarah Johnson",
      company: "TechCorp",
      status: "Hot",
    },
    {
      name: "Mike Chen",
      company: "StartupXYZ",
      status: "Warm",
    },
    {
      name: "Emma Davis",
      company: "Enterprise Inc",
      status: "Cold",
    },
  ];

  const features: Feature[] = [
    {
      icon: Users,
      title: "Lead Capture",
      description: "Easily add new leads with built-in validation.",
      color: "bg-blue-500",
    },
    {
      icon: Search,
      title: "Search & Filter",
      description: "Organize and find leads instantly.",
      color: "bg-green-500",
    },
    {
      icon: FileSpreadsheet,
      title: "CSV Import & Export",
      description: "Bulk manage data with one click.",
      color: "bg-purple-500",
    },
  ];

  const stats: Stat[] = [
    { value: 127, label: "Total Leads", color: "blue" },
    { value: 24, label: "Hot Leads", color: "green" },
    { value: 43, label: "Warm Leads", color: "orange" },
    { value: 60, label: "Cold Leads", color: "gray" },
  ];

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Animated cursor follower */}
      <motion.div
        className="fixed w-4 h-4 bg-blue-500 rounded-full pointer-events-none z-50 mix-blend-difference"
        animate={{
          x: mousePosition.x - 8,
          y: mousePosition.y - 8,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
      />

      {/* Animated background elements */}
      <motion.div
        style={{ y: backgroundY }}
        className="absolute inset-0 overflow-hidden"
      >
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
      </motion.div>

      {/* Navbar */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center space-x-2">
                <motion.div
                  className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <Database className="w-5 h-5 text-white" />
                </motion.div>
                <span className="text-xl font-bold text-gray-900">LeadHub</span>
              </div>
            </motion.div>
            <div className="flex items-center space-x-6">
              <motion.a
                href="#features"
                className="text-gray-600 hover:text-gray-900 transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                Features
              </motion.a>
              <motion.a
                href="https://github.com/aadarsh8434"
                className="text-gray-600 hover:text-gray-900 transition-colors flex items-center space-x-1"
                whileHover={{ scale: 1.05 }}
              >
                <Github className="w-4 h-4" />
                <span>GitHub (Open Source)</span>
              </motion.a>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-all duration-200"
                  onClick={() => router.push("/signin")}
                >
                  Sign In
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section
        className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-white"
        ref={heroRef}
      >
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={isVisible ? "visible" : "hidden"}
              className="space-y-8"
            >
              <motion.div variants={itemVariants}>
                <Badge
                  variant="secondary"
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 border-blue-200"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <Sparkles className="w-4 h-4" />
                  </motion.div>
                  <span>Open Source Project</span>
                </Badge>
              </motion.div>

              <motion.div className="space-y-4" variants={itemVariants}>
                <motion.h1
                  className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight text-balance"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  Simple, Structured{" "}
                  <motion.span
                    className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                    animate={{ backgroundPosition: ["0%", "100%", "0%"] }}
                    transition={{ duration: 5, repeat: Infinity }}
                  >
                    Lead Management
                  </motion.span>
                </motion.h1>
                <motion.p
                  className="text-xl text-gray-600 leading-relaxed text-pretty"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  LeadHub helps you capture, track, and manage buyer leads with
                  clarity. A clean, practical, and open-source solution.
                </motion.p>
              </motion.div>

              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                variants={itemVariants}
              >
                <motion.div
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl transition-all duration-200"
                    onClick={() => router.push("/signin")}
                  >
                    Sign In
                    <motion.div
                      className="ml-2"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="secondary"
                    size="lg"
                    className="px-8 py-4 rounded-xl text-neutral-600 border border-gray-300 hover:border-gray-400 transition-all duration-200"
                  >
                    <Github className="w-5 h-5 mr-2" />
                    View on GitHub
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>

            <motion.div
              className="relative"
              variants={floatingVariants}
              initial="initial"
              animate="animate"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-3xl blur-3xl opacity-20"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="relative bg-white rounded-2xl shadow-2xl p-8 border border-gray-100"
                initial={{ opacity: 0, scale: 0.8, rotateY: 45 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
                whileHover={{
                  rotateY: 5,
                  rotateX: 5,
                  transition: { duration: 0.2 },
                }}
              >
                <div className="space-y-4">
                  <motion.div
                    className="flex items-center justify-between"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <h3 className="text-lg font-semibold text-gray-900">
                      Recent Leads
                    </h3>
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-700"
                      >
                        24 Active
                      </Badge>
                    </motion.div>
                  </motion.div>
                  <div className="space-y-3">
                    {leads.map((lead, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1 + index * 0.1 }}
                        whileHover={{
                          scale: 1.02,
                          backgroundColor: "#f8fafc",
                          transition: { duration: 0.2 },
                        }}
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {lead.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {lead.company}
                          </p>
                        </div>
                        <motion.div whileHover={{ scale: 1.1 }}>
                          <Badge
                            variant={
                              lead.status === "Hot"
                                ? "default"
                                : lead.status === "Warm"
                                ? "secondary"
                                : "outline"
                            }
                            className={`text-xs ${
                              lead.status === "Hot"
                                ? "bg-red-500 text-white hover:bg-red-600"
                                : lead.status === "Warm"
                                ? "bg-orange-600 text-white hover:bg-orange-700"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {lead.status}
                          </Badge>
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white" ref={featuresRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            animate={
              featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }
            }
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to manage leads
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built for simplicity and efficiency, with all the features you
              need to stay organized.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                initial="hidden"
                animate={featuresInView ? "visible" : "hidden"}
                whileHover="hover"
                transition={{ delay: index * 0.2 }}
              >
                <Card className="group h-full border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-8">
                    <motion.div
                      className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-6`}
                      whileHover={{
                        scale: 1.2,
                        rotate: 360,
                        transition: { duration: 0.5 },
                      }}
                    >
                      <feature.icon className="w-6 h-6 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Preview Section */}
      <section className="py-20 bg-gray-50" ref={previewRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            animate={
              previewInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }
            }
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Clean, data-first interface designed for productivity
            </h2>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.9, rotateX: 45 }}
            animate={
              previewInView
                ? { opacity: 1, scale: 1, rotateX: 0 }
                : { opacity: 0, scale: 0.9, rotateX: 45 }
            }
            transition={{ duration: 1, delay: 0.2 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-3xl blur-3xl opacity-10"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              <motion.div
                className="bg-gray-100 px-6 py-4 border-b border-gray-200"
                initial={{ opacity: 0, y: -20 }}
                animate={
                  previewInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }
                }
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center space-x-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className={`w-3 h-3 rounded-full ${
                        i === 0
                          ? "bg-red-400"
                          : i === 1
                          ? "bg-orange-400"
                          : "bg-green-400"
                      }`}
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.7, 1, 0.7],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.3,
                      }}
                    />
                  ))}
                  <span className="ml-4 text-sm text-gray-600">
                    LeadHub Dashboard
                  </span>
                </div>
              </motion.div>
              <motion.div
                className="p-8"
                initial={{ opacity: 0 }}
                animate={previewInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 0.7 }}
              >
                <div className="grid grid-cols-4 gap-6 mb-8">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={index}
                      className={`bg-${stat.color}-50 p-4 rounded-lg text-center`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={
                        previewInView
                          ? { opacity: 1, scale: 1 }
                          : { opacity: 0, scale: 0.8 }
                      }
                      transition={{ delay: 0.8 + index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <motion.div
                        className={`text-2xl font-bold text-${stat.color}-600`}
                        initial={{ opacity: 0 }}
                        animate={
                          previewInView ? { opacity: 1 } : { opacity: 0 }
                        }
                        transition={{ delay: 1 + index * 0.1 }}
                      >
                        <motion.span
                          style={{ display: "inline-block" }}
                          animate={{
                            scale: [1, 1.1, 1],
                            textShadow: [
                              "0px 0px 0px rgba(0,0,0,0)",
                              "0px 0px 8px rgba(0,0,0,0.3)",
                              "0px 0px 0px rgba(0,0,0,0)",
                            ],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: 2 + index * 0.5,
                          }}
                        >
                          {stat.value}
                        </motion.span>
                      </motion.div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
                <motion.div
                  className="bg-gray-50 rounded-lg p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={
                    previewInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                  }
                  transition={{ delay: 1.2 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">
                      Lead Management Table
                    </h3>
                    <div className="flex space-x-2">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button variant="secondary" size="sm">
                          <Filter className="w-4 h-4 mr-2" />
                          Filter
                        </Button>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button variant="secondary" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="bg-white p-3 rounded border border-gray-200 flex items-center justify-between"
                        initial={{ opacity: 0, x: -50 }}
                        animate={
                          previewInView
                            ? { opacity: 1, x: 0 }
                            : { opacity: 0, x: -50 }
                        }
                        transition={{ delay: 1.4 + i * 0.1 }}
                        whileHover={{
                          scale: 1.02,
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          transition: { duration: 0.2 },
                        }}
                      >
                        <div className="flex items-center space-x-4">
                          <motion.div
                            className="w-8 h-8 bg-gray-300 rounded-full"
                            animate={{
                              backgroundColor: [
                                "#d1d5db",
                                "#9ca3af",
                                "#d1d5db",
                              ],
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              delay: i * 0.5,
                            }}
                          />
                          <div>
                            <motion.div
                              className="w-24 h-3 bg-gray-300 rounded mb-1"
                              animate={{
                                backgroundColor: [
                                  "#d1d5db",
                                  "#9ca3af",
                                  "#d1d5db",
                                ],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.3,
                              }}
                            />
                            <motion.div
                              className="w-16 h-2 bg-gray-200 rounded"
                              animate={{
                                backgroundColor: [
                                  "#e5e7eb",
                                  "#d1d5db",
                                  "#e5e7eb",
                                ],
                              }}
                              transition={{
                                duration: 2.5,
                                repeat: Infinity,
                                delay: i * 0.4,
                              }}
                            />
                          </div>
                        </div>
                        <motion.div
                          className="w-12 h-6 bg-blue-100 rounded"
                          whileHover={{ scale: 1.1 }}
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Closing CTA */}
      <motion.section
        className="py-20 bg-white"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.h2
            className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8 text-balance"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Start managing your leads better with LeadHub
          </motion.h2>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="secondary"
                size="lg"
                className="px-8 py-4 rounded-xl border-gray-300 hover:border-gray-400 transition-all duration-200 bg-transparent"
              >
                <Github className="w-5 h-5 mr-2" />
                GitHub
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        className="bg-gray-50 border-t border-gray-200"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <motion.div
              className="flex items-center space-x-6 mb-4 md:mb-0"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <motion.a
                href="https://github.com"
                className="text-gray-600 hover:text-gray-900 transition-colors"
                whileHover={{ scale: 1.05, color: "#111827" }}
              >
                GitHub
              </motion.a>
              <motion.a
                href="#"
                className="text-gray-600 hover:text-gray-900 transition-colors"
                whileHover={{ scale: 1.05, color: "#111827" }}
              >
                Readme
              </motion.a>
              <motion.a
                href="#"
                className="text-gray-600 hover:text-gray-900 transition-colors"
                whileHover={{ scale: 1.05, color: "#111827" }}
              >
                Contact
              </motion.a>
            </motion.div>
            <motion.p
              className="text-gray-600 text-center"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              © 2025 LeadHub — Built with{" "}
              <motion.span
                animate={{
                  scale: [1, 1.2, 1],
                  color: ["#ef4444", "#f97316", "#ef4444"],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                ❤️
              </motion.span>{" "}
              by Avinash | Open Source
            </motion.p>
          </div>
        </div>
      </motion.footer>

      {/* Floating scroll indicator */}
      <motion.div
        className="fixed bottom-8 right-8 z-40"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2 }}
      >
        <motion.div
          className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer shadow-lg"
          whileHover={{ scale: 1.1, backgroundColor: "#1d4ed8" }}
          whileTap={{ scale: 0.9 }}
          animate={{
            y: [0, -8, 0],
            boxShadow: [
              "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
              "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <motion.div animate={{ rotate: 180 }} transition={{ duration: 0.3 }}>
            <ArrowRight className="w-5 h-5 text-white rotate-[-90deg]" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-blue-600 origin-left z-50"
        style={{ scaleX: scrollYProgress }}
      />
    </div>
  );
}
