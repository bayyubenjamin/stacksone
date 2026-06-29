;; Config updated 2026-06-29T14:18:05Z
(define-constant ERR-UNAUTHORIZED (err u401))
(define-data-var config-version uint u12)

(define-read-only (get-config-version)
  (ok (var-get config-version))
)
