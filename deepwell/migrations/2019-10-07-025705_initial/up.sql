CREATE TABLE users (
    user_id BIGINT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE pages (
    page_id BIGINT PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    alt_title TEXT,
    tags TEXT[] NOT NULL
);

CREATE TABLE parents (
    page_id BIGINT NOT NULL REFERENCES pages(page_id),
    parent_page_id BIGINT NOT NULL REFERENCES pages(page_id),
    PRIMARY KEY (page_id, parent_page_id)
);

CREATE TABLE revisions (
    revision_id BIGINT PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    page_id BIGINT NOT NULL REFERENCES pages(page_id),
    user_id BIGINT NOT NULL REFERENCES users(user_id),
    git_commit TEXT NOT NULL UNIQUE,
    changes JSONB NOT NULL
);

CREATE TABLE ratings (
    page_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    rating SMALLINT NOT NULL,
    PRIMARY KEY (page_id, user_id)
);

CREATE TABLE ratings_history (
    rating_id BIGINT PRIMARY KEY,
    page_id BIGINT NOT NULL REFERENCES pages(page_id),
    user_id BIGINT NOT NULL REFERENCES users(user_id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    rating SMALLINT
);

CREATE TABLE authors (
    page_id BIGINT NOT NULL REFERENCES pages(page_id),
    user_id BIGINT NOT NULL REFERENCES users(user_id),
    author_type TEXT NOT NULL CHECK (
        author_type IN (
            'author',
            'rewrite',
            'translator',
            'maintainer'
        )
    ),
    created_at DATE NOT NULL,
    PRIMARY KEY (page_id, user_id, author_type)
);

CREATE TABLE files (
    file_id BIGINT PRIMARY KEY,
    file_name TEXT NOT NULL UNIQUE,
    file_uri TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    page_id BIGINT NOT NULL REFERENCES pages(page_id)
);
