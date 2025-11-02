package com.ra.userservice.security.principle;

import com.ra.userservice.model.entity.Users;
import com.ra.userservice.repository.IUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserDetailService implements UserDetailsService {
    private final IUserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Users users = userRepository.findByEmail(username).orElseThrow(() -> new UsernameNotFoundException("Username không tìm thấy"));
        return UserDetail.builder()
                .user(users)
                .authorities(users.getRoles().stream().map(roles -> new SimpleGrantedAuthority(roles.getRoleName().toString())).toList())
                .build();
    }
}
