export const generateOTP = (length = 4): string => {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
  };

export const isEmailOrPhone = (input: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/; // adjust for your region
  
    if (emailRegex.test(input)) {
      return 'email';
    } else if (phoneRegex.test(input)) {
      return 'phone';
    } else {
      return 'invalid';
    }
  }