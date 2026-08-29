package com.pharmacy.posbackend.dto;

import com.pharmacy.posbackend.entity.Role;
import lombok.Data;

@Data
public class RegisterRequest {
    private String username;
    private String password;
    private String fullName;
    private String email;
    private String phone;
    private Role role;
}