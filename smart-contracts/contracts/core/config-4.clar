;; Config updated 2026-06-15T03:34:46Z
(define-constant ERR-UNAUTHORIZED (err u401))
(define-data-var config-version uint u90)

(define-read-only (get-config-version)
  (ok (var-get config-version))
)
