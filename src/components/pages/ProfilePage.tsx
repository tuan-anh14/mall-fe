import { User, ShoppingBag, Heart, Settings, LogOut, Package, LayoutDashboard } from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Separator } from "../ui/separator";
import { orders, products } from "../../lib/mock-data";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { toast } from "sonner@2.0.3";

interface ProfilePageProps {
  onNavigate: (page: string, data?: any) => void;
  onLogout?: () => void;
  user?: any;
}

export function ProfilePage({ onNavigate, onLogout, user: userProp }: ProfilePageProps) {
  const user = userProp || {
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "JD",
    memberSince: "January 2024",
  };

  const wishlistProducts = products.slice(0, 4);

  const handleDeleteAccount = () => {
    toast.error("Account deletion is not available in demo mode");
  };

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    } else {
      toast.error("Logout function not available");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-white/10 rounded-2xl p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <Avatar className="h-24 w-24 border-4 border-white/10">
            <AvatarFallback className="text-3xl bg-gradient-to-br from-purple-500 to-blue-500">
              {user.avatar}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl text-white mb-2">{user.name}</h1>
            <p className="text-white/60 mb-1">{user.email}</p>
            <p className="text-sm text-white/50">Member since {user.memberSince}</p>
            {user.userType && (
              <Badge className="mt-2 bg-purple-500/20 text-purple-400 border-purple-500/30">
                {user.userType === "seller" ? "Seller Account" : "Buyer Account"}
              </Badge>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            {user.userType === "seller" && (
              <Button 
                className="bg-gradient-to-r from-purple-600 to-blue-600"
                onClick={() => onNavigate("dashboard")}
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Seller Dashboard
              </Button>
            )}
            <Button variant="outline" onClick={() => onNavigate("settings")}>
              <Settings className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
          <ShoppingBag className="h-8 w-8 text-purple-400 mx-auto mb-2" />
          <p className="text-3xl text-white mb-1">{orders.length}</p>
          <p className="text-sm text-white/60">Total Orders</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
          <Package className="h-8 w-8 text-blue-400 mx-auto mb-2" />
          <p className="text-3xl text-white mb-1">1</p>
          <p className="text-sm text-white/60">In Transit</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
          <Heart className="h-8 w-8 text-pink-400 mx-auto mb-2" />
          <p className="text-3xl text-white mb-1">{wishlistProducts.length}</p>
          <p className="text-sm text-white/60">Wishlist</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
          <span className="text-3xl mb-2 block">💰</span>
          <p className="text-3xl text-white mb-1">$2.1K</p>
          <p className="text-sm text-white/60">Total Spent</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="w-full justify-start bg-white/5 border-b border-white/10 rounded-none">
          <TabsTrigger value="orders">Order History</TabsTrigger>
          <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-8">
          <div className="space-y-4">
            {orders.map((order) => {
              const orderItems = order.items.map((item) => ({
                ...item,
                product: products.find((p) => p.id === item.productId)!,
              }));

              return (
                <div
                  key={order.id}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-purple-500/50 transition-all cursor-pointer"
                  onClick={() => onNavigate("orders")}
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <div>
                      <h3 className="text-xl text-white mb-1">Order {order.id}</h3>
                      <p className="text-sm text-white/60">Placed on {order.date}</p>
                    </div>
                    <Badge
                      className={
                        order.status === "Delivered"
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                      }
                    >
                      {order.status}
                    </Badge>
                  </div>

                  <div className="flex gap-4 mb-4">
                    {orderItems.slice(0, 3).map((item) => (
                      <div
                        key={item.productId}
                        className="w-20 h-20 bg-white/5 rounded-lg overflow-hidden flex-shrink-0"
                      >
                        <ImageWithFallback
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {orderItems.length > 3 && (
                      <div className="w-20 h-20 bg-white/5 rounded-lg flex items-center justify-center">
                        <span className="text-white/50">+{orderItems.length - 3}</span>
                      </div>
                    )}
                  </div>

                  <Separator className="bg-white/10 mb-4" />

                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm text-white/60">Total: </span>
                      <span className="text-xl text-white">${order.total.toFixed(2)}</span>
                    </div>
                    <div className="flex gap-2">
                      {order.status !== "Delivered" && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate("orders");
                          }}
                        >
                          Track Order
                        </Button>
                      )}
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-purple-600 to-blue-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate("orders");
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="wishlist" className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlistProducts.map((product) => (
              <div
                key={product.id}
                className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all"
              >
                <div 
                  className="relative aspect-square bg-white/5 overflow-hidden cursor-pointer"
                  onClick={() => onNavigate("product", product)}
                >
                  <ImageWithFallback
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-white mb-2 line-clamp-1">{product.name}</h3>
                  <p className="text-2xl text-white mb-3">${product.price}</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
                      onClick={() => toast.success("Added to cart!")}
                    >
                      Add to Cart
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => toast.success("Removed from wishlist")}
                    >
                      <Heart className="h-4 w-4 fill-current" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-8">
          <div className="max-w-2xl">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="text-xl text-white mb-4">Account Settings</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white">Email Notifications</p>
                      <p className="text-sm text-white/60">
                        Receive updates about your orders
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => onNavigate("settings")}>
                      Configure
                    </Button>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white">Password</p>
                      <p className="text-sm text-white/60">Change your password</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => onNavigate("settings")}>
                      Update
                    </Button>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white">Payment Methods</p>
                      <p className="text-sm text-white/60">Manage saved cards</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => onNavigate("settings")}>
                      Manage
                    </Button>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white">Shipping Addresses</p>
                      <p className="text-sm text-white/60">Manage delivery addresses</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => onNavigate("settings")}>
                      Manage
                    </Button>
                  </div>
                </div>
              </div>

              <Separator className="bg-white/10" />

              <div>
                <h3 className="text-xl text-white mb-4">Danger Zone</h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full text-red-400 border-red-500/30 hover:bg-red-500/10"
                    onClick={handleLogoutClick}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full text-red-400 border-red-500/30 hover:bg-red-500/10"
                    onClick={handleDeleteAccount}
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
