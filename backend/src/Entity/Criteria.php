<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use App\Repository\CriteriaRepository;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: CriteriaRepository::class)]
class Criteria
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups("filter:read")]
    private ?int $id = null;

    #[ORM\Column(type: "string", length: 255)]
    #[Groups("filter:read")] // Add a serialization group
    private string $type; // Amount, Title, Date

    #[ORM\Column(type: "string", length: 255)]
    #[Groups("filter:read")] // Add a serialization group
    private string $selection; // More/Less/Equals, Starts with/Ends with/Contains, etc.

    #[ORM\Column(type: "string", length: 255, nullable: true)]
    #[Groups("filter:read")] // Add a serialization group
    private ?string $value = null; // Depending on type, this could be integer or string

    #[ORM\Column(type: "string", length: 255, nullable: true)]
    #[Groups("filter:read")]
    private ?string $operator = null; // Add the operator field

    #[ORM\ManyToOne(targetEntity: Filter::class, inversedBy: "criteria")]
    #[ORM\JoinColumn(nullable: false)]
    private Filter $filter;

    // Getters and Setters

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getType(): string
    {
        return $this->type;
    }

    public function setType(string $type): self
    {
        $this->type = $type;
        return $this;
    }

    public function getSelection(): string
    {
        return $this->selection;
    }

    public function setSelection(string $selection): self
    {
        $this->selection = $selection;
        return $this;
    }

    public function getOperator(): ?string
    {
        return $this->operator;
    }

    public function setOperator(?string $operator): self
    {
        $this->operator = $operator;
        return $this;
    }

    public function getValue(): ?string
    {
        return $this->value;
    }

    public function setValue(?string $value): self
    {
        $this->value = $value;
        return $this;
    }

    public function getFilter(): Filter
    {
        return $this->filter;
    }

    public function setFilter(Filter $filter): self
    {
        $this->filter = $filter;
        return $this;
    }
}