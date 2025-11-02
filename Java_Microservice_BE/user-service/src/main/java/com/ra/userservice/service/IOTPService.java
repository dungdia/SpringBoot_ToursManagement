package com.ra.userservice.service;

import com.ra.userservice.exception.CustomException;

public interface IOTPService {
    void sendSimpleMessage(String to,String subject,String text) throws CustomException;
    void sendHTMLMessage(String to,String subject,String html) throws CustomException;
}
