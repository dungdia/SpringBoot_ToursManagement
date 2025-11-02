package com.ra.userservice.service.Impl;

import com.ra.userservice.exception.CustomException;
import com.ra.userservice.service.IOTPService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class OTPServiceImpl implements IOTPService {
    private final JavaMailSender emailSender;

    @Override
    public void sendSimpleMessage(String to, String subject, String text) throws CustomException {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        try {
            emailSender.send(message);  // Gửi email
        } catch (Exception e) {
            throw new CustomException("Không thể gửi email", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public void sendHTMLMessage(String to, String subject, String html) throws CustomException {
        try{
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper;
            helper = new MimeMessageHelper(message,true);
            helper.setFrom("dduc1711@gmail.com");
            helper.setSubject(subject);
            helper.setTo(to);
            helper.setText(html, true);
            emailSender.send(message);
        }catch (MessagingException e){
            log.error("Error sending email {}", e.getMessage());
        }
    }
}
