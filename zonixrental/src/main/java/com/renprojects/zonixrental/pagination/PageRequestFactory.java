package com.renprojects.zonixrental.pagination;

import com.renprojects.zonixrental.exceptions.BadRequestException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

public final class PageRequestFactory {
    private static final int MAX_PAGE_SIZE = 100;

    private PageRequestFactory() {
    }

    public static PageRequest create(int page, int size) {
        if (page < 0) {
            throw new BadRequestException("Page must be zero or greater.");
        }
        if (size < 1 || size > MAX_PAGE_SIZE) {
            throw new BadRequestException("Page size must be between 1 and 100.");
        }
        return PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "id"));
    }
}