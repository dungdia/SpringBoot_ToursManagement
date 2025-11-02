package com.ra.userservice.validation.handle;

import com.ra.userservice.repository.IUserRepository;
import com.ra.userservice.validation.annotation.EmailExist;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class HandleEmailExist implements ConstraintValidator<EmailExist,String>
{
    private final IUserRepository userRepository;

    @Override
    public boolean isValid(String s, ConstraintValidatorContext constraintValidatorContext)
    {
        return !userRepository.existsByEmail(s);
    }
}