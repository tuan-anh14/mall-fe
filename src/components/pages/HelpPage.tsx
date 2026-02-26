import { HelpCircle, Search, ChevronDown, ChevronUp, MessageCircle, Mail, Phone } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { motion } from "motion/react";
import { useState } from "react";

interface HelpPageProps {
  onNavigate?: (page: string, data?: any) => void;
}

export function HelpPage({ onNavigate }: HelpPageProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    {
      id: "orders",
      title: "Orders & Shipping",
      icon: "📦",
      questions: [
        {
          question: "How can I track my order?",
          answer:
            "You can track your order by going to the Order Tracking page from your profile menu or by using the tracking number sent to your email. Simply enter your order number and email address to view real-time updates.",
        },
        {
          question: "What are the shipping options?",
          answer:
            "We offer Standard Shipping (5-7 business days), Express Shipping (2-3 business days), and Next Day Delivery. Shipping costs vary based on your location and the selected method.",
        },
        {
          question: "Can I change my shipping address after placing an order?",
          answer:
            "You can change your shipping address within 2 hours of placing the order. After that, please contact our customer support team for assistance.",
        },
        {
          question: "Do you ship internationally?",
          answer:
            "Yes, we ship to over 100 countries worldwide. International shipping rates and delivery times vary by destination. Additional customs fees may apply.",
        },
      ],
    },
    {
      id: "returns",
      title: "Returns & Refunds",
      icon: "🔄",
      questions: [
        {
          question: "What is your return policy?",
          answer:
            "We offer a 30-day return policy for most items. Products must be unused, in original packaging, and in the same condition as received. Some items like personalized products are not eligible for returns.",
        },
        {
          question: "How do I initiate a return?",
          answer:
            "Go to your order history, select the order you want to return, and click 'Request Return'. Follow the instructions to print your return label and ship the item back to us.",
        },
        {
          question: "When will I receive my refund?",
          answer:
            "Refunds are processed within 5-7 business days after we receive and inspect the returned item. The refund will be credited to your original payment method.",
        },
        {
          question: "Can I exchange an item?",
          answer:
            "Yes, we offer exchanges for different sizes or colors. Please contact customer support to arrange an exchange, or you can return the original item and place a new order.",
        },
      ],
    },
    {
      id: "payment",
      title: "Payment & Pricing",
      icon: "💳",
      questions: [
        {
          question: "What payment methods do you accept?",
          answer:
            "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, Apple Pay, Google Pay, and Shop Pay. For large orders, we also offer invoice payment options.",
        },
        {
          question: "Is it safe to use my credit card on your site?",
          answer:
            "Yes, your payment information is completely secure. We use industry-standard SSL encryption and are PCI DSS compliant. We never store your complete credit card information on our servers.",
        },
        {
          question: "Do you offer price matching?",
          answer:
            "Yes, we offer price matching for identical products sold by authorized retailers. Contact our customer support team with proof of the lower price within 7 days of your purchase.",
        },
        {
          question: "Can I use multiple discount codes?",
          answer:
            "Only one discount code can be applied per order. The system will automatically apply the discount that gives you the best savings.",
        },
      ],
    },
    {
      id: "account",
      title: "Account & Security",
      icon: "🔐",
      questions: [
        {
          question: "How do I reset my password?",
          answer:
            "Click 'Forgot Password' on the login page and enter your email address. You'll receive a password reset link via email. Follow the link to create a new password.",
        },
        {
          question: "Can I change my email address?",
          answer:
            "Yes, you can update your email address in the Account Settings page. You'll need to verify the new email address before it becomes active.",
        },
        {
          question: "How do I enable two-factor authentication?",
          answer:
            "Go to Settings > Security and enable 'Two-Factor Authentication'. You can choose to receive codes via SMS or use an authenticator app like Google Authenticator.",
        },
        {
          question: "How do I delete my account?",
          answer:
            "To delete your account, go to Settings > Account and scroll to the Danger Zone section. Please note that this action is irreversible and all your data will be permanently deleted.",
        },
      ],
    },
    {
      id: "products",
      title: "Products & Stock",
      icon: "🛍️",
      questions: [
        {
          question: "How do I know if an item is in stock?",
          answer:
            "Product availability is shown on each product page. If an item is out of stock, you can sign up for email notifications to be alerted when it's back in stock.",
        },
        {
          question: "Are the product images accurate?",
          answer:
            "We strive to display accurate product images. However, colors may vary slightly due to monitor settings. Check the product description for detailed specifications.",
        },
        {
          question: "Do you offer warranties on products?",
          answer:
            "Many of our products come with manufacturer warranties. Warranty details are listed on each product page. We also offer extended warranty options at checkout.",
        },
        {
          question: "Can I pre-order upcoming products?",
          answer:
            "Yes, pre-orders are available for select upcoming products. Pre-order items are clearly marked and will ship on or before the release date.",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-white mb-2">How can we help you?</h1>
          <p className="text-white/60">Find answers to common questions or contact support</p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50" />
            <Input
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 bg-white/5 border-white/10 text-white placeholder:text-white/50 text-lg"
            />
          </div>
        </motion.div>

        {/* Quick Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12"
        >
          <Card className="bg-white/5 border-white/10 hover:border-white/20 transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-white mb-1">Live Chat</h3>
              <p className="text-sm text-white/60 mb-3">Chat with our support team</p>
              <Button variant="ghost" size="sm" className="text-purple-400">
                Start Chat
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 hover:border-white/20 transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-3">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-white mb-1">Email Support</h3>
              <p className="text-sm text-white/60 mb-3">Get help via email</p>
              <Button
                variant="ghost"
                size="sm"
                className="text-purple-400"
                onClick={() => onNavigate?.("contact")}
              >
                Send Email
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 hover:border-white/20 transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-3">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-white mb-1">Phone Support</h3>
              <p className="text-sm text-white/60 mb-3">Call us: +1 234 567 8900</p>
              <Button variant="ghost" size="sm" className="text-purple-400">
                Call Now
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* FAQ Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-white mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-3">
                      <span className="text-2xl">{category.icon}</span>
                      {category.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {category.questions.map((item, qIndex) => (
                        <AccordionItem
                          key={qIndex}
                          value={`${category.id}-${qIndex}`}
                          className="border-white/10"
                        >
                          <AccordionTrigger className="text-white hover:text-purple-400 text-left">
                            {item.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-white/70">
                            {item.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Still Need Help */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12"
        >
          <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30">
            <CardContent className="p-8 text-center">
              <h3 className="text-white mb-2">Still need help?</h3>
              <p className="text-white/60 mb-6">
                Our customer support team is available 24/7 to assist you
              </p>
              <Button
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                onClick={() => onNavigate?.("contact")}
              >
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
