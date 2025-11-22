import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Sparkles, Lock, ArrowRight } from "lucide-react";

const Login = () => {
    const { signInWithGoogle, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate("/");
        }
    }, [user, navigate]);

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 animate-gradient-xy">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCAzLjk5LTRDNDIuMjEgMzAgNDQgMzEuNzkgNDQgMzRjMCAyLjIxLTEuNzkgNC00IDRDMTY3LjggMzggMzYgMzYuMjEgMzYgMzR6bTAgMTBjMC0yLjIxIDEuNzktNCAzLjk5LTRDNDIuMjEgNDAgNDQgNDEuNzkgNDQgNDRjMCAyLjIxLTEuNzkgNC00IDRDMTY3LjggNDggMzYgNDYuMjEgMzYgNDR6bTEwLTEwYzAtMi4yMSAxLjc5LTQgMy45OS00QzUyLjIxIDMwIDU0IDMxLjc5IDU0IDM0YzAgMi4yMS0xLjc5IDQtNCA0QzQ3LjggMzggNDYgMzYuMjEgNDYgMzR6bTAgMTBjMC0yLjIxIDEuNzktNCAzLjk5LTRDNTIuMjEgNDAgNTQgNDEuNzkgNTQgNDRjMCAyLjIxLTEuNzkgNC00IDRDNDY3LjggNDggNDYgNDYuMjEgNDYgNDR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
            </div>

            {/* Floating Elements */}
            <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-float"></div>
            <div className="absolute bottom-20 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-float-delayed"></div>
            <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/10 rounded-full blur-xl animate-float-slow"></div>

            {/* Login Card */}
            <div className="relative z-10 w-full max-w-md">
                {/* Glassmorphism Card */}
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 md:p-12 transform hover:scale-[1.02] transition-all duration-300">
                    {/* Logo/Icon */}
                    <div className="flex justify-center mb-8">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-pink-500 rounded-full blur-lg opacity-75 animate-pulse"></div>
                            <div className="relative bg-white rounded-full p-4">
                                <Lock className="w-12 h-12 text-indigo-600" />
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 flex items-center justify-center gap-2">
                            Welcome Back
                            <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse" />
                        </h1>
                        <p className="text-white/80 text-lg">
                            Sign in to access your pharmacy dashboard
                        </p>
                    </div>

                    {/* Divider */}
                    <div className="relative mb-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/20"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white/10 text-white/60 rounded-full">
                                Secure Login
                            </span>
                        </div>
                    </div>

                    {/* Google Sign In Button */}
                    <Button
                        onClick={signInWithGoogle}
                        className="w-full h-14 bg-white hover:bg-gray-50 text-gray-800 font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-3 group"
                    >
                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        <span className="text-lg">Continue with Google</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>

                    {/* Footer Text */}
                    <p className="text-center text-white/60 text-sm mt-8">
                        Protected by enterprise-grade security
                    </p>
                </div>

                {/* Bottom Glow */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur-2xl opacity-50"></div>
            </div>

            {/* Custom Styles */}
            <style>{`
                @keyframes gradient-xy {
                    0%, 100% {
                        background-position: 0% 0%;
                    }
                    50% {
                        background-position: 100% 100%;
                    }
                }
                
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-20px);
                    }
                }
                
                @keyframes float-delayed {
                    0%, 100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-30px);
                    }
                }
                
                @keyframes float-slow {
                    0%, 100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-15px);
                    }
                }
                
                .animate-gradient-xy {
                    background-size: 400% 400%;
                    animation: gradient-xy 15s ease infinite;
                }
                
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                
                .animate-float-delayed {
                    animation: float-delayed 8s ease-in-out infinite;
                }
                
                .animate-float-slow {
                    animation: float-slow 10s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default Login;
