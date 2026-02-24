package com.revshop.security;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import com.revshop.service.security.TokenBlacklistService;
import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CustomUserDetailsService userDetailsService;
    
    @Autowired
    private TokenBlacklistService tokenBlacklistService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);

            try {
                // Check if token is blacklisted FIRST
                if (tokenBlacklistService.isBlacklisted(token)) {
                    chain.doFilter(request, response);
                    return;
                }

                // Validate token signature and claims
                if (!jwtUtil.validateToken(token)) {
                    chain.doFilter(request, response);
                    return;
                }

                // Extract email from token
                String email = jwtUtil.extractEmail(token);

                // Load user and set authentication
                if (email != null && 
                    SecurityContextHolder.getContext().getAuthentication() == null) {

                    UserDetails userDetails = 
                        userDetailsService.loadUserByUsername(email);

                    UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    auth.setDetails(
                            new WebAuthenticationDetailsSource()
                                    .buildDetails(request)
                    );

                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(auth);
                }
            } catch (Exception e) {
                // Log error but continue filter chain
                System.err.println("JWT validation error: " + e.getMessage());
            }
        }

        chain.doFilter(request, response);
    }
}
