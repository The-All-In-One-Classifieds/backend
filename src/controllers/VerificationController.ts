import {Request, Response} from "express";
import verifyEmail from "../templates/SingupVerificationTemplate";
import MailService from "../services/MailService";
import {prisma} from "../db";
import {AppException} from "../common/AppException";

export class VerificationController {
    async create(request: Request, response: Response) {
        const userEmail = request.body.email;

        if(!userEmail) {
            throw new AppException("Invalid email provided")
        }

        // const OTP = "2339"
        const randomNumber = Math.floor(Math.random() * 9999) + 1;
        // Convert the number to a string and pad it with zeros if necessary
        const OTP = randomNumber.toString().padStart(4, '0');
        //SEND VERIFICATION MAIL TO USER
        const emailTemplate = verifyEmail(OTP);
        const mailService = MailService.getInstance();
        await mailService.createConnection();
        const mailResponse = await mailService.sendMail("EmailRequest", {
            to: userEmail,
            subject: 'Verify OTP',
            html: emailTemplate.html,
        });

        if (!mailResponse.success) {
            console.error("Failed to send email");
            return response.status(500).json({ message: "Failed to send verification email." });
        }

        const currentTime = new Date();
        const expiryTime = new Date(currentTime.getTime());
        expiryTime.setMinutes(currentTime.getMinutes() + 5);

        await prisma.emailVerification.upsert({
            where: {
                email: userEmail,
            },
            update: {
                otp: OTP,
                created_at: currentTime,
                expires_at: expiryTime,
            },
            create: {
                email: userEmail,
                otp: OTP,
                created_at: currentTime,
                expires_at: expiryTime,
            }
        });

        return response.status(200).json({ message: "Verification email sent." });
    }

    async verify(request: Request, response: Response) {
        const userEmail = request.body.email;
        const otp = request.body.otp as String;

        if(!userEmail) {
            throw new AppException("Invalid email provided")
        }

        if(!otp || otp.length !== 4) {
            throw new AppException("Invalid OTP provided")
        }

        const otpData = await prisma.emailVerification.findUnique({
            where: {
                email: userEmail
            }
        });

        if(!otpData) {
            throw new AppException("Cannot verify this email")
        }

        if(otpData.otp !== otp) {
            throw new AppException("Incorrect OTP")
        }

        const currentTime = new Date();
        if (otpData.expires_at < currentTime) {
            throw new AppException("OTP has been expired")
        }

        return response.status(204).json();
    }
}
