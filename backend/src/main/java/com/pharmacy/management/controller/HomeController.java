package com.pharmacy.management.controller;

import org.springframework.stereotype.Controller;
// Remove the GetMapping import since we're removing the only mapping
// import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {
    // Removing the duplicate mapping for "/"
    // @GetMapping("/")
    // public String home() {
    //     return "index";
    // }
} 