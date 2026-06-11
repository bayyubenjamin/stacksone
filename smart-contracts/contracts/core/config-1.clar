;; Config updated 2026-06-11T18:26:22Z
(define-constant ERR-UNAUTHORIZED (err u401))
(define-data-var config-version uint u55)

(define-read-only (get-config-version)
  (ok (var-get config-version))
)
