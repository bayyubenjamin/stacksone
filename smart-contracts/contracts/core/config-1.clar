;; Config updated 2026-06-13T02:02:17Z
(define-constant ERR-UNAUTHORIZED (err u401))
(define-data-var config-version uint u76)

(define-read-only (get-config-version)
  (ok (var-get config-version))
)
