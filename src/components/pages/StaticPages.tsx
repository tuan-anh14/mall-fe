import React from "react";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

export function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl text-white mb-6">About ShopHub</h1>
        <p className="text-xl text-white/70 mb-12">
          Your premium destination for quality products since 2024.
        </p>

        <div className="prose prose-invert max-w-none space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-3xl text-white mb-4">Our Story</h2>
            <p className="text-white/70 mb-4">
              ShopHub was founded with a simple mission: to create a premium e-commerce platform that connects quality products with discerning customers. We believe that shopping online should be an enjoyable, seamless experience.
            </p>
            <p className="text-white/70">
              Today, we serve thousands of customers worldwide, offering carefully curated products across electronics, fashion, home goods, and more. Our commitment to excellence drives everything we do.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-3">🌟</div>
              <h3 className="text-2xl text-white mb-2">Premium Quality</h3>
              <p className="text-white/60">Only the best products make it to our platform</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-3">🚚</div>
              <h3 className="text-2xl text-white mb-2">Fast Shipping</h3>
              <p className="text-white/60">Get your orders delivered in 2-3 days</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-3">🔒</div>
              <h3 className="text-2xl text-white mb-2">Secure Payments</h3>
              <p className="text-white/60">Your data is protected with us</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl text-white mb-6 text-center">Contact Us</h1>
        <p className="text-xl text-white/70 mb-12 text-center">
          Have questions? We'd love to hear from you.
        </p>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl text-white mb-6">Send us a message</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" className="bg-white/5 border-white/10" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" className="bg-white/5 border-white/10" />
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" className="bg-white/5 border-white/10" />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  rows={5}
                  className="bg-white/5 border-white/10"
                />
              </div>
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
              >
                Send Message
              </Button>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl text-white mb-1">Email</h3>
                  <p className="text-white/70">support@shophub.com</p>
                  <p className="text-white/70">sales@shophub.com</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Phone className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl text-white mb-1">Phone</h3>
                  <p className="text-white/70">+1 (555) 123-4567</p>
                  <p className="text-white/70">+1 (555) 987-6543</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-6 w-6 text-pink-400" />
                </div>
                <div>
                  <h3 className="text-xl text-white mb-1">Address</h3>
                  <p className="text-white/70">123 Shopping Street</p>
                  <p className="text-white/70">New York, NY 10001</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-6 w-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-xl text-white mb-1">Business Hours</h3>
                  <p className="text-white/70">Monday - Friday: 9am - 6pm</p>
                  <p className="text-white/70">Saturday - Sunday: 10am - 4pm</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl text-white mb-6">Terms of Service</h1>
        <p className="text-white/60 mb-8">Last updated: November 10, 2025</p>

        <div className="prose prose-invert max-w-none space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl text-white mb-4">1. Acceptance of Terms</h2>
            <p className="text-white/70">
              By accessing and using ShopHub, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl text-white mb-4">2. Use License</h2>
            <p className="text-white/70">
              Permission is granted to temporarily download one copy of the materials on ShopHub for personal, non-commercial transitory viewing only.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl text-white mb-4">3. Disclaimer</h2>
            <p className="text-white/70">
              The materials on ShopHub are provided on an 'as is' basis. ShopHub makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl text-white mb-6">Privacy Policy</h1>
        <p className="text-white/60 mb-8">Last updated: November 10, 2025</p>

        <div className="prose prose-invert max-w-none space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl text-white mb-4">Information We Collect</h2>
            <p className="text-white/70">
              We collect information you provide directly to us, such as when you create an account, make a purchase, or contact customer support.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl text-white mb-4">How We Use Your Information</h2>
            <p className="text-white/70">
              We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl text-white mb-4">Information Sharing</h2>
            <p className="text-white/70">
              We do not share your personal information with third parties except as described in this policy or with your consent.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CareersPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl text-white mb-6">Careers at ShopHub</h1>
        <p className="text-xl text-white/70 mb-12">
          Join our team and help us build the future of e-commerce.
        </p>

        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl text-white mb-4">Why Work With Us?</h2>
            <p className="text-white/70 mb-6">
              At ShopHub, we're building more than just an e-commerce platform. We're creating experiences that delight customers and empower sellers. Join us in this journey!
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div className="text-3xl mb-2">💼</div>
                <h3 className="text-white mb-1">Competitive Pay</h3>
                <p className="text-sm text-white/60">Industry-leading compensation</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div className="text-3xl mb-2">🏖️</div>
                <h3 className="text-white mb-1">Work-Life Balance</h3>
                <p className="text-sm text-white/60">Flexible hours & remote options</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div className="text-3xl mb-2">📈</div>
                <h3 className="text-white mb-1">Growth</h3>
                <p className="text-sm text-white/60">Career development opportunities</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl text-white mb-4">Open Positions</h2>
            <div className="space-y-4">
              <div className="border border-white/10 rounded-xl p-6 hover:bg-white/5 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl text-white">Senior Frontend Developer</h3>
                  <span className="text-purple-400">Remote</span>
                </div>
                <p className="text-white/60 mb-4">Build beautiful, responsive user interfaces using React and modern web technologies.</p>
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600">Apply Now</Button>
              </div>
              <div className="border border-white/10 rounded-xl p-6 hover:bg-white/5 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl text-white">Product Designer</h3>
                  <span className="text-purple-400">New York, NY</span>
                </div>
                <p className="text-white/60 mb-4">Design intuitive and delightful experiences for millions of users.</p>
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600">Apply Now</Button>
              </div>
              <div className="border border-white/10 rounded-xl p-6 hover:bg-white/5 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl text-white">Customer Success Manager</h3>
                  <span className="text-purple-400">Remote</span>
                </div>
                <p className="text-white/60 mb-4">Help our customers succeed and build lasting relationships.</p>
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600">Apply Now</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReturnsPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl text-white mb-6">Returns & Refunds</h1>
        <p className="text-xl text-white/70 mb-12">
          We want you to be completely satisfied with your purchase.
        </p>

        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl text-white mb-4">Our Return Policy</h2>
            <p className="text-white/70 mb-4">
              We offer a 30-day return policy on most items. If you're not satisfied with your purchase, you can return it for a full refund or exchange.
            </p>
            <ul className="space-y-2 text-white/70">
              <li>• Items must be unused and in original packaging</li>
              <li>• Return shipping is free for defective items</li>
              <li>• Refunds processed within 5-7 business days</li>
              <li>• Some items may not be eligible for returns</li>
            </ul>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl text-white mb-4">How to Return an Item</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 text-purple-400">1</div>
                <div>
                  <h3 className="text-white mb-1">Request a Return</h3>
                  <p className="text-white/60">Go to your order history and select the item you want to return</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 text-purple-400">2</div>
                <div>
                  <h3 className="text-white mb-1">Print Return Label</h3>
                  <p className="text-white/60">We'll email you a prepaid return shipping label</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 text-purple-400">3</div>
                <div>
                  <h3 className="text-white mb-1">Ship It Back</h3>
                  <p className="text-white/60">Pack the item securely and drop it off at any carrier location</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 text-purple-400">4</div>
                <div>
                  <h3 className="text-white mb-1">Get Your Refund</h3>
                  <p className="text-white/60">Once we receive the item, your refund will be processed</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl text-white mb-4">Non-Returnable Items</h2>
            <p className="text-white/70 mb-4">The following items cannot be returned:</p>
            <ul className="space-y-2 text-white/70">
              <li>• Personalized or custom-made items</li>
              <li>• Health and personal care items</li>
              <li>• Gift cards</li>
              <li>• Downloadable software products</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ShippingPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl text-white mb-6">Shipping Information</h1>
        <p className="text-xl text-white/70 mb-12">
          Fast, reliable shipping to your doorstep.
        </p>

        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl text-white mb-4">Shipping Options</h2>
            <div className="space-y-4">
              <div className="border border-white/10 rounded-xl p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl text-white">Standard Shipping</h3>
                  <span className="text-purple-400">$4.99</span>
                </div>
                <p className="text-white/60">Delivery in 5-7 business days</p>
              </div>
              <div className="border border-white/10 rounded-xl p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl text-white">Express Shipping</h3>
                  <span className="text-purple-400">$9.99</span>
                </div>
                <p className="text-white/60">Delivery in 2-3 business days</p>
              </div>
              <div className="border border-white/10 rounded-xl p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl text-white">Next Day Delivery</h3>
                  <span className="text-purple-400">$19.99</span>
                </div>
                <p className="text-white/60">Order by 2pm for next day delivery</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl text-white mb-4">Free Shipping</h2>
            <p className="text-white/70 mb-4">
              Enjoy free standard shipping on orders over $50! No code needed, discount applied automatically at checkout.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl text-white mb-4">International Shipping</h2>
            <p className="text-white/70 mb-4">
              We ship to over 100 countries worldwide. International shipping rates and delivery times vary by destination. Additional customs fees may apply.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl text-white mb-4">Order Tracking</h2>
            <p className="text-white/70 mb-4">
              Track your order anytime by visiting the Order Tracking page or clicking the tracking link in your shipping confirmation email.
            </p>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600">Track Order</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CookiesPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl text-white mb-6">Cookie Policy</h1>
        <p className="text-white/60 mb-8">Last updated: November 10, 2025</p>

        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl text-white mb-4">What Are Cookies?</h2>
            <p className="text-white/70">
              Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our site.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl text-white mb-4">How We Use Cookies</h2>
            <p className="text-white/70 mb-4">We use cookies for various purposes:</p>
            <ul className="space-y-2 text-white/70">
              <li>• <strong className="text-white">Essential Cookies:</strong> Required for the website to function properly</li>
              <li>• <strong className="text-white">Performance Cookies:</strong> Help us understand how visitors interact with our site</li>
              <li>• <strong className="text-white">Functional Cookies:</strong> Remember your preferences and settings</li>
              <li>• <strong className="text-white">Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
            </ul>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl text-white mb-4">Managing Cookies</h2>
            <p className="text-white/70">
              You can control and manage cookies in your browser settings. Please note that removing or blocking cookies may impact your user experience and some features may not function properly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GDPRPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl text-white mb-6">GDPR Compliance</h1>
        <p className="text-white/60 mb-8">Last updated: November 10, 2025</p>

        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl text-white mb-4">Your Rights Under GDPR</h2>
            <p className="text-white/70 mb-4">
              If you are a resident of the European Economic Area (EEA), you have certain data protection rights under the General Data Protection Regulation (GDPR).
            </p>
            <ul className="space-y-2 text-white/70">
              <li>• <strong className="text-white">Right to Access:</strong> You can request copies of your personal data</li>
              <li>• <strong className="text-white">Right to Rectification:</strong> You can request correction of inaccurate data</li>
              <li>• <strong className="text-white">Right to Erasure:</strong> You can request deletion of your personal data</li>
              <li>• <strong className="text-white">Right to Restrict Processing:</strong> You can request limitation of data processing</li>
              <li>• <strong className="text-white">Right to Data Portability:</strong> You can request transfer of your data</li>
              <li>• <strong className="text-white">Right to Object:</strong> You can object to processing of your data</li>
            </ul>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl text-white mb-4">How to Exercise Your Rights</h2>
            <p className="text-white/70 mb-4">
              To exercise any of your GDPR rights, please contact our Data Protection Officer at privacy@shophub.com. We will respond to your request within 30 days.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl text-white mb-4">Data Security</h2>
            <p className="text-white/70">
              We implement appropriate technical and organizational measures to protect your personal data against unauthorized or unlawful processing, accidental loss, destruction, or damage.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl text-white mb-4">Contact Us</h2>
            <p className="text-white/70">
              If you have any questions about our GDPR compliance or data protection practices, please contact us at privacy@shophub.com.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
